<?php

use App\Models\Form;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('can_upload_a_single_avatar_image_for_a_form', function () {
    $form = Form::factory()->create();
    Storage::fake();

    // test with valid file size
    $this->actingAs($form->user)
        ->json('POST', route('api.forms.images.store', $form->uuid), [
            'image' => UploadedFile::fake()->image('avatar.jpeg'),
            'type' => 'avatar',
        ])
        ->assertStatus(201);

    $form = $form->fresh();
    $this->assertTrue($form->hasImage('avatar'));
    $this->assertNotNull($form->avatar_path);
    Storage::assertExists($form->avatar_path);
});

test('cannot_upload_avatar_if_wrong_format_or_too_big', function () {
    Storage::fake();
    $form = Form::factory()->create();

    // test with invalid file type
    $this->actingAs($form->user)
        ->json('POST', route('api.forms.images.store', ['form' => $form->uuid]), [
            'image' => UploadedFile::fake()->create('avatar.pdf'),
            'type' => 'avatar',
        ])
        ->assertStatus(422);

    // test with too large file
    $this->actingAs($form->user)
        ->json('POST', route('api.forms.images.store', ['form' => $form->uuid]), [
            'image' => UploadedFile::fake()->create('avatar.pdf')->size(2500),
            'type' => 'avatar',
        ])
        ->assertStatus(422);

    $this->assertFalse($form->hasImage('avatar'));
});

test('can_delete_an_uploaded_avatar_image_for_a_form', function () {
    Storage::fake();
    $form = Form::factory()->create();

    // upload image first
    $this->actingAs($form->user)
        ->json('POST', route('api.forms.images.store', $form->uuid), [
            'image' => UploadedFile::fake()->image('avatar.png'),
            'type' => 'avatar',
        ]);

    $form = $form->fresh();
    $this->assertTrue($form->hasImage('avatar'));

    // delete image now
    $this->actingAs($form->user)
        ->json('DELETE', route('api.forms.images.store', $form->uuid), [
            'type' => 'avatar',
        ])
        ->assertStatus(200);

    $form = $form->fresh();
    $this->assertFalse($form->hasImage('avatar'));
    $this->assertNull($form->avatar_path);
});

test('trying_to_delete_avatar_if_nothing_is_set_does_nothing', function () {
    Storage::fake();
    $form = Form::factory()->create();

    // should have no avatar
    $this->assertFalse($form->hasImage('avatar'));
    $this->assertNull($form->avatar_path);

    // delete image now
    $this->actingAs($form->user)
        ->json('DELETE', route('api.forms.images.store', $form->uuid), [
            'type' => 'avatar',
        ])
        ->assertStatus(200);

    $form = $form->fresh();
    // nothing has changed
    $this->assertFalse($form->hasImage('avatar'));
    $this->assertNull($form->avatar_path);
});

test('can_upload_a_form_background_image', function () {
    $form = Form::factory()->create();
    Storage::fake();

    // test with valid file size
    $this->actingAs($form->user)
        ->json('POST', route('api.forms.images.store', $form->uuid), [
            'image' => UploadedFile::fake()->image('background.jpg'),
            'type' => 'background',
        ])

        ->assertStatus(201);

    $form = $form->fresh();
    $this->assertTrue($form->hasImage('background'));
    $this->assertNotNull($form->background_path);
    Storage::assertExists($form->background_path);

    // delete image now
    $this->actingAs($form->user)
        ->json('DELETE', route('api.forms.images.store', $form->uuid), [
            'type' => 'background',
        ])
        ->assertStatus(200);

    $form = $form->fresh();
    $this->assertFalse($form->hasImage('background'));
    $this->assertNull($form->background_path);
    Storage::assertMissing($form->background_path);
});
