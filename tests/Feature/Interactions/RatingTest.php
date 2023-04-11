<?php

use App\Models\FormBlockInteraction;
use App\Enums\FormBlockInteractionType;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('can_update_options_for_range_interaction', function () {
    $interaction = FormBlockInteraction::factory()->create([
        'type' => FormBlockInteractionType::range->value,
    ]);

    $response = $this->actingAs($interaction->formBlock->form->user)
        ->json('post', route('api.interactions.update', $interaction), [
            'options' => [
                'start' => 5,
                'end' => 10,
                'icon' => 'globe',
                'color' => "#223344",
            ]
        ])
        ->assertStatus(200);

    $response->assertJsonFragment([
        'start' => 5,
        'end' => 10,
        'icon' => 'globe',
        'color' => "#223344",
    ]);
});
