<?php

use App\Enums\FormBlockType;
use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormBlockInteraction;
use App\Models\FormBlockLogic;
use App\Models\FormSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake();

    $this->form = Form::factory()->create([
        'avatar_path' => 'form/avatar.png',
        'background_path' => 'form/background.png',
    ]);
    Storage::put($this->form->avatar_path, 'image');
    Storage::put($this->form->background_path, 'image');
    // a resized copy, as the image route caches it
    Storage::put('.cache/form/avatar.png/resized', 'image');

    $block = FormBlock::factory()->for($this->form)->create(['type' => FormBlockType::file]);
    $interaction = FormBlockInteraction::factory()->for($block)->create();
    FormBlockLogic::factory()->for($block)->create();

    $this->upload = FormSession::factory()->for($this->form)->create()->formSessionResponses()->create([
        'form_block_id' => $block->id,
        'form_block_interaction_id' => $interaction->id,
        'value' => 'cv.pdf',
    ])->saveUpload(UploadedFile::fake()->create('cv.pdf'));

    $this->files = [$this->upload->path, $this->form->avatar_path, $this->form->background_path, '.cache/form/avatar.png/resized'];
});

test('deleting a form for good removes its uploaded files, images and logic rules', function () {
    $otherFormsRule = FormBlockLogic::factory()->create();
    $this->form->delete();

    $this->actingAs($this->form->user)
        ->json('DELETE', route('api.forms.trashed.delete', $this->form->uuid))
        ->assertOk();

    expect(FormBlockLogic::pluck('id')->all())->toBe([$otherFormsRule->id]);
    Storage::assertMissing($this->files);
});

test('moving a form to the trash keeps its files and logic rules, so it can be restored', function () {
    $this->actingAs($this->form->user)
        ->json('DELETE', route('api.forms.delete', $this->form->uuid))
        ->assertOk();

    expect(FormBlockLogic::count())->toBe(1);
    Storage::assertExists($this->files);

    $this->json('POST', route('api.forms.trashed.restore', $this->form->uuid))->assertOk();

    expect($this->form->fresh()->trashed())->toBeFalse();
});

test('deleting a form for good keeps the images its duplicate still uses', function () {
    $copy = $this->form->duplicate('Copy');
    expect($copy->avatar_path)->toBe($this->form->avatar_path);

    $this->form->delete();
    $copy->delete();

    $this->actingAs($this->form->user)
        ->json('DELETE', route('api.forms.trashed.delete', $copy->uuid))
        ->assertOk();

    // the original is in the trash and can still be restored with its images
    Storage::assertExists($this->files);

    $this->json('DELETE', route('api.forms.trashed.delete', $this->form->uuid))->assertOk();

    Storage::assertMissing($this->files);
});
