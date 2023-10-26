<?php

use App\Enums\FormBlockInteractionType;
use App\Models\FormBlockInteraction;
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
                'labelLeft' => 'Test Left',
                'labelRight' => 'Test Right',
            ],
        ])
        ->assertStatus(200);

    $response->assertJsonFragment([
        'start' => 5,
        'end' => 10,
        'labelLeft' => 'Test Left',
        'labelRight' => 'Test Right',
    ]);
});
