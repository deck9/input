<?php

namespace Tests\Feature;

use App\Enums\FormBlockInteractionType;
use App\Enums\FormBlockType;
use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormBlockInteraction;
use App\Models\FormSession;
use App\Models\FormSessionUpload;
use Illuminate\Database\Events\TransactionBeginning;
use Illuminate\Database\Events\TransactionCommitted;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Exceptions;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use League\Flysystem\Config;
use League\Flysystem\Filesystem;
use League\Flysystem\Local\LocalFilesystemAdapter;
use League\Flysystem\UnableToWriteFile;

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
    $interaction = fileQuestion([]);
    // store the options as given, like a value saved before saving capped it
    $interaction->fill(['options' => $options])->saveQuietly();
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
    'a question count above the server limit' => [['allowedFiles' => 50], 10],
    'a negative question count' => [['allowedFiles' => -1], 10],
    'no question count' => [[], 10],
]);

test('an upload over the allowed file count leaves no file on the S3 disk', function () {
    config(['filesystems.default' => 'minio']);
    Storage::fake('minio');
    $interaction = fileQuestion(['allowedFiles' => 1]);
    $session = answerFileQuestion($interaction);

    uploadFile($session, $interaction, UploadedFile::fake()->image('face.png'))->assertCreated();
    uploadFile($session, $interaction, UploadedFile::fake()->image('one-more.png'))->assertStatus(422);

    expect(Storage::disk('minio')->allFiles('uploads'))->toHaveCount(1);
});

test('an upload locks its answer before it counts and saves', function () {
    Storage::fake();
    $interaction = fileQuestion(['allowedFiles' => 2]);
    $session = answerFileQuestion($interaction);

    $steps = [];
    Event::listen(TransactionBeginning::class, function () use (&$steps) {
        $steps[] = 'begin';
    });
    Event::listen(TransactionCommitted::class, function () use (&$steps) {
        $steps[] = 'commit';
    });
    DB::listen(function ($query) use (&$steps) {
        $sql = str_replace(['`', '"'], '', $query->sql);
        $steps[] = match (true) {
            str_starts_with($sql, 'update form_session_responses') => 'lock the answer',
            str_starts_with($sql, 'select count(*) as aggregate from form_session_uploads') => 'count',
            str_starts_with($sql, 'insert into form_session_uploads') => 'save',
            default => null,
        };
    });

    uploadFile($session, $interaction, UploadedFile::fake()->image('face.png'))->assertCreated();

    // parallel uploads can't run in one test process; the PR lists the manual parallel check
    expect(array_values(array_filter($steps)))->toBe(['count', 'begin', 'lock the answer', 'count', 'save', 'commit']);
});

test('a full answer is refused before the file is written', function () {
    Storage::fake();
    $interaction = fileQuestion(['allowedFiles' => 1]);
    $session = answerFileQuestion($interaction);
    $answer = $session->formSessionResponses()->first();
    // a row without a file: the answer's folder only appears if the refused file gets written (a delete keeps the folder)
    $answer->formSessionUploads()->create(['uuid' => Str::uuid(), 'name' => 'cv.pdf', 'path' => 'cv.pdf', 'type' => 'application/pdf', 'size' => 1]);

    uploadFile($session, $interaction, UploadedFile::fake()->image('one-more.png'))
        ->assertStatus(422)
        ->assertJsonValidationErrors(['file' => 'This question takes at most 1 files.']);

    expect(Storage::directoryExists("uploads/{$answer->id}"))->toBeFalse();
});

test('a file the disk fails to store is refused and takes no place in the limit', function (string $disk) {
    Exceptions::fake();
    config(['filesystems.default' => $disk]);
    Storage::fake($disk);
    $workingDisk = Storage::disk($disk);
    // reads like the fake disk but refuses every write; with 'throw' => false a refused write returns false
    $adapter = new class(Storage::path('')) extends LocalFilesystemAdapter
    {
        public function writeStream(string $path, $contents, Config $config): void
        {
            throw UnableToWriteFile::atLocation($path, 'No space left on device');
        }
    };
    // the disk's own settings: a fake disk keeps 'throw' but drops 'report'
    Storage::set($disk, new FilesystemAdapter(new Filesystem($adapter), $adapter, config("filesystems.disks.{$disk}")));
    $interaction = fileQuestion(['allowedFiles' => 1]);
    $session = answerFileQuestion($interaction);

    uploadFile($session, $interaction, UploadedFile::fake()->image('face.png'))->assertServerError();

    // the log gets the disk's reason and the refusal
    Exceptions::assertReported(fn (UnableToWriteFile $e) => $e->reason() === 'No space left on device');
    Exceptions::assertReported(fn (\RuntimeException $e) => $e->getMessage() === 'The uploaded file could not be stored.');
    expect(FormSessionUpload::count())->toBe(0)
        ->and(Storage::allFiles('uploads'))->toBeEmpty();

    Storage::set($disk, $workingDisk);
    uploadFile($session, $interaction, UploadedFile::fake()->image('face.png'))->assertCreated();
})->with(['local', 'minio']);

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

test('submitting answers again keeps the files that already went through', function () {
    Storage::fake();
    $interaction = fileQuestion([]);
    $session = answerFileQuestion($interaction);
    uploadFile($session, $interaction, UploadedFile::fake()->image('face.png'))->assertCreated();

    // a retry after a failed upload: the form page sends only the files that failed
    answerFileQuestion($interaction, $session);

    expect(FormSessionUpload::count())->toBe(1)
        ->and(Storage::allFiles('uploads'))->toHaveCount(1);
});
