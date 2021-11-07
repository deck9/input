<?php

namespace Tests\Feature\Forms;

use Tests\TestCase;
use App\Models\Form;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AvatarTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function can_upload_a_single_avatar_image_for_a_form()
    {
        $form = Form::factory()->create();
        Storage::fake('images');

        // test with valid file size
        $this->actingAs($form->user)
            ->json('POST', route('api.forms.images.store', $form->uuid), [
                'image' => UploadedFile::fake()->image('avatar.jpeg'),
            ])
            ->assertStatus(201);

        $form = $form->fresh();
        $this->assertTrue($form->hasAvatar());
        $this->assertNotNull($form->avatar_path);
        Storage::disk('images')->assertExists($form->avatar_path);
    }

    /** @test */
    public function cannot_upload_avatar_if_wrong_format_or_too_big()
    {
        Storage::fake('images');
        $form = Form::factory()->create();

        // test with invalid file type
        $this->actingAs($form->user)
            ->json('POST', route('api.forms.images.store', ['uuid' => $form->uuid]), [
                'image' => UploadedFile::fake()->create('avatar.pdf'),
            ])
            ->assertStatus(422);

        // test with too large file
        $this->actingAs($form->user)
            ->json('POST', route('api.forms.images.store', ['uuid' => $form->uuid]), [
                'image' => UploadedFile::fake()->create('avatar.pdf')->size(2500),
            ])
            ->assertStatus(422);

        $this->assertFalse($form->hasAvatar());
    }



    /** @test */
    public function can_delete_an_uploaded_avatar_image_for_a_form()
    {
        Storage::fake('images');
        $form = Form::factory()->create();

        // upload image first
        $this->actingAs($form->user)
            ->json('POST', route('api.forms.images.store', $form->uuid), [
                'image' => UploadedFile::fake()->image('avatar.png'),
            ]);

        $form = $form->fresh();
        $this->assertTrue($form->hasAvatar());

        // delete image now
        $this->actingAs($form->user)
            ->json('DELETE', route('api.forms.images.store', $form->uuid))
            ->assertStatus(200);

        $form = $form->fresh();
        $this->assertFalse($form->hasAvatar());
        $this->assertNull($form->avatar_path);
    }
}
