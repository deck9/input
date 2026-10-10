<?php

namespace Tests\Feature;

use App\Enums\FormBlockInteractionType;
use App\Enums\FormBlockType;
use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormBlockInteraction;
use App\Models\FormSession;
use App\Models\FormSessionUpload;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

function fileQuestion(array $options, ?Form $form = null): FormBlockInteraction
{
    return FormBlockInteraction::factory()->create([
        'type' => FormBlockInteractionType::file,
        'options' => $options,
        'form_block_id' => FormBlock::factory()->create([
            'type' => FormBlockType::file,
            'form_id' => $form ?? Form::factory(),
        ]),
    ]);
}

function answerFileQuestion(FormBlockInteraction $interaction, ?FormSession $session = null, bool $isUploading = true): FormSession
{
    $block = $interaction->formBlock;
    $session ??= FormSession::factory()->create(['form_id' => $block->form_id]);

    test()->json('POST', route('api.public.forms.submit', ['form' => $block->form->uuid]), [
        'token' => $session->token,
        'is_uploading' => $isUploading,
        'payload' => [$block->uuid => ['actionId' => $interaction->uuid, 'payload' => 'upload']],
    ])->assertOk();

    return $session;
}

function uploadFile(FormSession $session, FormBlockInteraction $interaction, ?UploadedFile $file)
{
    return test()->json('POST', route('api.public.forms.file-upload', ['form' => $session->form->uuid]), array_filter([
        'token' => $session->token,
        'actionId' => $interaction->uuid,
        'file' => $file,
    ]));
}

dataset('uploadForm', [
    '{"description":null,"language":"en","avatar_path":null,"background_path":null,"brand_color":"#1f2937","text_color":null,"background_color":null,"eoc_text":null,"eoc_headline":null,"data_retention_days":null,"is_auto_delete_enabled":false,"legal_notice_link":null,"privacy_link":null,"cta_label":null,"cta_link":null,"cta_append_params":false,"cta_redirect_delay":0,"use_cta_redirect":false,"cta_append_session_id":false,"linkedin":null,"github":null,"instagram":null,"facebook":null,"twitter":null,"show_cta_link":false,"show_social_links":false,"use_brighter_inputs":false,"show_form_progress":false,"blocks":[{"type":"input-file","message":"<p>File Upload Test<\/p>","title":null,"options":null,"is_required":false,"is_disabled":false,"parent_block":null,"sequence":0,"formBlockInteractions":[{"type":"input","name":null,"is_editable":true,"is_disabled":false,"label":null,"options":{"allowedFileTypes":[],"allowedFiles":10,"allowedFileSize":4},"message":null,"sequence":0},{"type":"file","name":null,"is_editable":true,"is_disabled":false,"label":null,"options":{"allowedFileTypes":{"image":true,"video":true,"audio":true,"text":true},"allowedFiles":"2","allowedFileSize":"4"},"message":null,"sequence":1}]}]}',
]);

test('can upload a file through special endpoint and attach it to the session', function ($template) {
    $form = Form::factory()->create();
    $form->applyTemplate($template);

    $session = FormSession::factory()->create(['form_id' => $form->id]);

    $this->json('POST', route('api.public.forms.submit', [
        'form' => $form->uuid,
    ]), [
        'token' => $session->token,
        'payload' => [
            ...$form->formBlocks[0]->getSubmitPayload(1),
        ],
    ])->assertStatus(200);

    $file = UploadedFile::fake()->image('face.png');

    $response = $this->json('POST', route('api.public.forms.file-upload', [
        'form' => $form->uuid,
    ]), [
        'token' => $session->token,
        'actionId' => $form->formBlocks[0]->formBlockInteractions[0]->uuid,
        'file' => $file,
    ])->assertStatus(201);

    $form->refresh();

    $this->assertCount(
        1,
        $form->formBlocks[0]
            ->formBlockInteractions[0]
            ->formSessionResponses[0]
            ->formSessionUploads
    );
})->with('uploadForm');

test('an upload finds the interaction of its own form when another form uses the same id', function ($template) {
    $otherInteraction = FormBlockInteraction::factory()->create();

    $form = Form::factory()->create();
    $form->applyTemplate($template);
    $interaction = $form->formBlocks[0]->formBlockInteractions[0];

    $otherInteraction->update(['uuid' => $interaction->uuid]);

    $session = FormSession::factory()->create(['form_id' => $form->id]);

    $this->json('POST', route('api.public.forms.submit', [
        'form' => $form->uuid,
    ]), [
        'token' => $session->token,
        'payload' => [
            ...$form->formBlocks[0]->getSubmitPayload(1),
        ],
    ])->assertStatus(200);

    $this->json('POST', route('api.public.forms.file-upload', [
        'form' => $form->uuid,
    ]), [
        'token' => $session->token,
        'actionId' => $interaction->uuid,
        'file' => UploadedFile::fake()->image('face.png'),
    ])->assertStatus(201);
})->with('uploadForm');

test('an upload without a file is rejected', function () {
    $interaction = fileQuestion([]);
    $session = answerFileQuestion($interaction);

    uploadFile($session, $interaction, null)->assertStatus(422)->assertJsonValidationErrors('file');
});

test('an upload of a type the question does not allow is rejected and stores nothing', function () {
    Storage::fake();
    $interaction = fileQuestion(['allowedFileTypes' => ['image' => true, 'video' => false]]);
    $session = answerFileQuestion($interaction);

    uploadFile($session, $interaction, UploadedFile::fake()->create('notes.pdf', 10, 'application/pdf'))
        ->assertStatus(422)
        ->assertJsonValidationErrors('file');
    uploadFile($session, $interaction, UploadedFile::fake()->image('face.png'))->assertCreated();

    expect(FormSessionUpload::count())->toBe(1)
        ->and(Storage::allFiles('uploads'))->toHaveCount(1);
});

test('an upload over the allowed file size is rejected and stores nothing', function (array $options, int $kilobytes) {
    Storage::fake();
    $interaction = fileQuestion($options);
    $session = answerFileQuestion($interaction);

    uploadFile($session, $interaction, UploadedFile::fake()->create('big.pdf', $kilobytes + 1))
        ->assertStatus(422)
        ->assertJsonValidationErrors('file');
    uploadFile($session, $interaction, UploadedFile::fake()->create('small.pdf', $kilobytes))->assertCreated();

    expect(FormSessionUpload::count())->toBe(1)
        ->and(Storage::allFiles('uploads'))->toHaveCount(1);
})->with([
    'the question size' => [['allowedFileSize' => '1'], 1024],
    'a question size above the server limit' => [['allowedFileSize' => 16], 8192],
    'no question size' => [[], 8192],
]);

test('an upload over the allowed file count is rejected and stores nothing', function (array $options, int $count) {
    Storage::fake();
    $interaction = fileQuestion($options);
    $session = answerFileQuestion($interaction);

    for ($i = 0; $i < $count; $i++) {
        uploadFile($session, $interaction, UploadedFile::fake()->image("face-{$i}.png"))->assertCreated();
    }

    uploadFile($session, $interaction, UploadedFile::fake()->image('one-more.png'))
        ->assertStatus(422)
        ->assertJsonValidationErrors('file');

    expect(FormSessionUpload::count())->toBe($count)
        ->and(Storage::allFiles('uploads'))->toHaveCount($count);
})->with([
    'the question count' => [['allowedFiles' => '2'], 2],
    'no question count' => [[], 10],
]);

test('an upload for a question that is not a file question is rejected', function () {
    Storage::fake();
    $interaction = FormBlockInteraction::factory()->create([
        'type' => FormBlockInteractionType::input,
        'form_block_id' => FormBlock::factory()->create(['type' => FormBlockType::short]),
    ]);
    $session = answerFileQuestion($interaction);

    uploadFile($session, $interaction, UploadedFile::fake()->image('face.png'))
        ->assertStatus(422)
        ->assertJsonValidationErrors('actionId');

    expect(Storage::allFiles('uploads'))->toBeEmpty();
});

test('an upload before the answer is submitted is rejected', function () {
    Storage::fake();
    $interaction = fileQuestion([]);
    $session = FormSession::factory()->create(['form_id' => $interaction->formBlock->form_id]);

    uploadFile($session, $interaction, UploadedFile::fake()->image('face.png'))
        ->assertStatus(422)
        ->assertJsonValidationErrors('actionId');

    expect(Storage::allFiles('uploads'))->toBeEmpty();
});

test('a file block that still holds an old non-file interaction takes the limits of its file interaction', function () {
    Storage::fake();
    $interaction = fileQuestion(['allowedFiles' => 1]);
    $oldInteraction = FormBlockInteraction::factory()->create([
        'type' => FormBlockInteractionType::input,
        'options' => ['allowedFiles' => 10],
        'form_block_id' => $interaction->form_block_id,
    ]);
    $session = answerFileQuestion($oldInteraction);

    uploadFile($session, $oldInteraction, UploadedFile::fake()->image('face.png'))->assertCreated();
    uploadFile($session, $oldInteraction, UploadedFile::fake()->image('one-more.png'))
        ->assertStatus(422)
        ->assertJsonValidationErrors('file');
});

test('limits uploads per visitor', function () {
    $interaction = fileQuestion([]);
    $session = answerFileQuestion($interaction);

    for ($i = 0; $i < 30; $i++) {
        uploadFile($session, $interaction, null)->assertStatus(422);
    }

    uploadFile($session, $interaction, null)->assertTooManyRequests();
});

test('submitting answers again before uploading removes the earlier files of that question', function () {
    Storage::fake();
    $interaction = fileQuestion(['allowedFiles' => 1]);
    $session = answerFileQuestion($interaction);
    uploadFile($session, $interaction, UploadedFile::fake()->image('face.png'))->assertCreated();

    answerFileQuestion($interaction, $session);
    uploadFile($session, $interaction, UploadedFile::fake()->image('face.png'))->assertCreated();

    expect(FormSessionUpload::count())->toBe(1)
        ->and(Storage::allFiles('uploads'))->toHaveCount(1);
});

test('submitting answers without uploading keeps the files', function () {
    Storage::fake();
    $interaction = fileQuestion([]);
    $session = answerFileQuestion($interaction);
    uploadFile($session, $interaction, UploadedFile::fake()->image('face.png'))->assertCreated();

    answerFileQuestion($interaction, $session, isUploading: false);
    test()->json('POST', route('api.public.forms.submit', ['form' => $session->form->uuid]), [
        'token' => $session->token,
    ])->assertOk();

    expect(FormSessionUpload::count())->toBe(1)
        ->and(Storage::allFiles('uploads'))->toHaveCount(1);
});

test('submitting answers again keeps the files of other sessions', function () {
    Storage::fake();
    $interaction = fileQuestion([]);
    $otherSession = answerFileQuestion($interaction);
    uploadFile($otherSession, $interaction, UploadedFile::fake()->image('face.png'))->assertCreated();

    answerFileQuestion($interaction);

    expect(FormSessionUpload::count())->toBe(1)
        ->and(Storage::allFiles('uploads'))->toHaveCount(1);
});

test('submitting answers again keeps the files of questions not in the answers', function () {
    Storage::fake();
    $form = Form::factory()->create();
    $interaction = fileQuestion([], $form);
    $otherInteraction = fileQuestion([], $form);
    $session = answerFileQuestion($otherInteraction);
    uploadFile($session, $otherInteraction, UploadedFile::fake()->image('face.png'))->assertCreated();

    answerFileQuestion($interaction, $session);

    expect(FormSessionUpload::count())->toBe(1)
        ->and(Storage::allFiles('uploads'))->toHaveCount(1);
});

test('submitting answers that fail to save keeps the files', function () {
    Storage::fake();
    $form = Form::factory()->create();
    $interaction = fileQuestion([], $form);
    $otherInteraction = fileQuestion([], $form);
    $session = answerFileQuestion($interaction);
    uploadFile($session, $interaction, UploadedFile::fake()->image('face.png'))->assertCreated();

    test()->json('POST', route('api.public.forms.submit', ['form' => $form->uuid]), [
        'token' => $session->token,
        'is_uploading' => true,
        'payload' => [
            $interaction->formBlock->uuid => ['actionId' => $interaction->uuid, 'payload' => 'upload'],
            $otherInteraction->formBlock->uuid => ['actionId' => 'unknown', 'payload' => 'upload'],
        ],
    ])->assertNotFound();

    expect(FormSessionUpload::count())->toBe(1)
        ->and(Storage::allFiles('uploads'))->toHaveCount(1);
});

test('submitting answers with numeric keys keeps the files of questions not in the answers', function () {
    Storage::fake();
    $form = Form::factory()->create();
    $interaction = fileQuestion([], $form);
    $otherInteraction = fileQuestion([], $form);
    $interaction->formBlock->update(['uuid' => 'aaaaaaaa']);
    $otherInteraction->formBlock->update(['uuid' => 'bbbbbbbb']);
    $session = answerFileQuestion($otherInteraction);
    uploadFile($session, $otherInteraction, UploadedFile::fake()->image('face.png'))->assertCreated();

    test()->json('POST', route('api.public.forms.submit', ['form' => $form->uuid]), [
        'token' => $session->token,
        'is_uploading' => true,
        'payload' => [['actionId' => $interaction->uuid, 'payload' => 'upload']],
    ])->assertOk();

    expect(FormSessionUpload::count())->toBe(1)
        ->and(Storage::allFiles('uploads'))->toHaveCount(1);
});
