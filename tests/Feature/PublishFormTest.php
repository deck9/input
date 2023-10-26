<?php

use App\Models\Form;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

test('user can publish a form', function () {
    Event::fake();

    $form = Form::factory()->create(['published_at' => null]);

    $this->actingAs($form->user)
        ->json('POST', route('api.forms.publish', $form->uuid))
        ->assertStatus(200);

    $this->assertNotNull($form->fresh()->published_at);
});

test('user can unpublish a form', function () {
    $form = Form::factory()->create(['published_at' => now()]);

    $this->actingAs($form->user)
        ->json('POST', route('api.forms.unpublish', $form->uuid))
        ->assertStatus(200);

    $this->assertNull($form->fresh()->published_at);
});
