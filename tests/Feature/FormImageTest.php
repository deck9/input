<?php

use App\Models\Form;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

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

test('replacing the image on a duplicated form keeps the original form\'s image', function (string $type) {
    Storage::fake();
    $original = Form::factory()->create([$type.'_path' => 'original/image.png']);
    Storage::put('original/image.png', 'image');
    $copy = $original->duplicate('Copy');

    $this->actingAs($copy->user)
        ->json('POST', route('api.forms.images.store', $copy->uuid), [
            'image' => UploadedFile::fake()->image('new.png'),
            'type' => $type,
        ])
        ->assertStatus(201);

    Storage::assertExists('original/image.png');
    expect($original->fresh()->hasImage($type))->toBeTrue();
})->with(['avatar', 'background']);

test('removing the image on a duplicated form keeps the original form\'s image', function (string $type) {
    Storage::fake();
    $original = Form::factory()->create([$type.'_path' => 'original/image.png']);
    Storage::put('original/image.png', 'image');
    $copy = $original->duplicate('Copy');

    $this->actingAs($copy->user)
        ->json('DELETE', route('api.forms.images.delete', $copy->uuid), ['type' => $type])
        ->assertStatus(200);

    expect($copy->fresh()->{$type.'_path'})->toBeNull();
    Storage::assertExists('original/image.png');
    expect($original->fresh()->hasImage($type))->toBeTrue();
})->with(['avatar', 'background']);

test('replacing or removing an image no other form uses deletes it and its resized copies', function (string $type) {
    Storage::fake();
    $form = Form::factory()->create([$type.'_path' => 'form/old.png']);
    Storage::put('form/old.png', 'image');
    Storage::put('.cache/form/old.png/resized', 'image');

    $this->actingAs($form->user)
        ->json('POST', route('api.forms.images.store', $form->uuid), [
            'image' => UploadedFile::fake()->image('new.png'),
            'type' => $type,
        ])
        ->assertStatus(201);

    Storage::assertMissing(['form/old.png', '.cache/form/old.png']);

    $newPath = $form->fresh()->{$type.'_path'};
    Storage::assertExists($newPath);

    $this->json('DELETE', route('api.forms.images.delete', $form->uuid), ['type' => $type])
        ->assertStatus(200);

    Storage::assertMissing($newPath);
})->with(['avatar', 'background']);
