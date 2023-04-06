<?php

use App\Models\Form;
use Mockery\MockInterface;
use App\Events\FormPublished;
use Spatie\Browsershot\Browsershot;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('can_show_an_page_with_the_hmtl_rendered_preview_image', function () {
    $form = Form::factory()->create();

    $this->get(route('internal.meta-preview', $form))
        ->assertStatus(200);
})->skip();

test('creates_a_preview_image_when_form_is_published', function () {
    $this->partialMock(Browsershot::class, function (MockInterface $mock) {
        $mock->shouldReceive('url')->once()->andReturn($mock);
        $mock->shouldReceive('save')->once();
    });

    $form = Form::factory()->create();

    $this->assertNull($form->preview_image_path);

    event(new FormPublished($form));

    // we only check if the path to the preview image is set after publishing
    $this->assertNotNull($form->fresh()->preview_image_path);
})->skip();
