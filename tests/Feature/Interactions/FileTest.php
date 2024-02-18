<?php

use App\Enums\FormBlockInteractionType;
use App\Models\FormBlockInteraction;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('can_not_update_interaction_with_empty_label', function () {
    $interaction = FormBlockInteraction::factory()->create([
        'type' => FormBlockInteractionType::button->value,
    ]);

    $this->actingAs($interaction->formBlock->form->user)
        ->json('post', route('api.interactions.update', $interaction), [
            'label' => '',
        ])
        ->assertStatus(422);

    $this->actingAs($interaction->formBlock->form->user)
        ->json('post', route('api.interactions.update', $interaction), [
            'label' => null,
        ])
        ->assertStatus(422);
})->skip();
