<?php

use App\Enums\FormBlockInteractionType;
use App\Enums\FormBlockType;
use App\Events\FormSessionCompletedEvent;
use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormBlockInteraction;
use App\Models\FormSession;
use App\Models\FormSessionResponse;
use App\Models\FormSessionUpload;
use App\Models\FormWebhook;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Event::fake([FormSessionCompletedEvent::class]);
    Storage::fake();

    $this->form = Form::factory()->create();
    FormWebhook::factory()->for($this->form)->create();

    $this->text = FormBlock::factory()->for($this->form)->create(['type' => FormBlockType::short, 'sequence' => 0]);
    FormBlockInteraction::factory()->for($this->text, 'formBlock')->input()->create();

    $file = FormBlock::factory()->for($this->form)->create(['type' => FormBlockType::file, 'sequence' => 1]);
    $this->fileAnswer = FormBlockInteraction::factory()->for($file, 'formBlock')->create(['type' => FormBlockInteractionType::file]);

    $this->routes = fn () => [
        'session' => ['post', route('api.public.forms.session.create', ['form' => $this->form->uuid]), ['preview' => true]],
        'submit' => ['post', route('api.public.forms.submit', ['form' => $this->form->uuid]), ['token' => 'preview', 'payload' => $this->text->fresh()->getSubmitPayload('Hello')]],
        'upload' => ['post', route('api.public.forms.file-upload', ['form' => $this->form->uuid]), ['token' => 'preview', 'actionId' => $this->fileAnswer->uuid, 'file' => UploadedFile::fake()->create('cv.pdf', 10)]],
    ];

    $this->assertNothingStored = function () {
        expect([FormSession::count(), FormSessionResponse::count(), FormSessionUpload::count(), Storage::allFiles()])->toBe([0, 0, 0, []]);

        Event::assertNotDispatched(FormSessionCompletedEvent::class);
    };
});

test('a team member can try a draft form in preview mode, and nothing is stored, counted or sent', function () {
    $this->form->update(['published_at' => null]);
    $member = User::factory()->withTeam($this->form->team)->create();

    $this->actingAs($member)
        ->json('post', route('api.public.forms.session.create', ['form' => $this->form->uuid]), ['preview' => true, 'params' => ['ref' => 'editor']])
        ->assertCreated()
        ->assertJson(['token' => 'preview', 'params' => ['ref' => 'editor'], 'is_completed' => false]);

    // the form page's order: answers, then files, then the final submit
    $submit = fn (bool $isUploading, ?array $payload) => $this->json('post', route('api.public.forms.submit', ['form' => $this->form->uuid]), [
        'token' => 'preview',
        'is_uploading' => $isUploading,
        'payload' => $payload,
    ])->assertNoContent();

    $submit(true, [
        ...$this->text->fresh()->getSubmitPayload('Hello'),
        $this->fileAnswer->formBlock->uuid => ['actionId' => $this->fileAnswer->uuid, 'payload' => 'upload'],
    ]);

    $this->json('post', route('api.public.forms.file-upload', ['form' => $this->form->uuid]), [
        'token' => 'preview',
        'actionId' => $this->fileAnswer->uuid,
        'file' => UploadedFile::fake()->create('cv.pdf', 10),
    ])->assertNoContent();

    $submit(false, null);

    ($this->assertNothingStored)();
});

test('only the form\'s team can use preview mode', function (string $route) {
    [$method, $uri, $data] = ($this->routes)()[$route];

    $this->json($method, $uri, $data)->assertForbidden();

    $this->actingAs(User::factory()->withTeam()->create())
        ->json($method, $uri, $data)
        ->assertForbidden();

    ($this->assertNothingStored)();
})->with(['session', 'submit', 'upload']);

test('a form session without preview is stored as before', function () {
    $this->json('post', route('api.public.forms.session.create', ['form' => $this->form->uuid]), ['preview' => false])
        ->assertCreated();

    expect(FormSession::count())->toBe(1)
        ->and(FormSession::first()->token)->toHaveLength(32);
});
