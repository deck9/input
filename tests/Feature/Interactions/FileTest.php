<?php

use App\Enums\FormBlockInteractionType;
use App\Models\FormBlockInteraction;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('can_change_settings_for_allowed_files', function () {
    $interaction = FormBlockInteraction::factory()->create([
        'type' => FormBlockInteractionType::file->value,
    ]);

    $response = $this->actingAs($interaction->formBlock->form->user)
        ->json('post', route('api.interactions.update', $interaction), [
            'options' => [
                'allowedFiles' => 1,
                'allowedFileSize' => 16,
                'allowedFileTypes' => [
                    'image' => true,
                    'audio' => true,
                    'video' => true,
                    'text' => true,
                ],
            ],
        ])
        ->assertStatus(200);

    $response->assertJsonFragment([
        'allowedFiles' => 1,
        'allowedFileSize' => 16,
        'allowedFileTypes' => [
            'image' => true,
            'audio' => true,
            'video' => true,
            'text' => true,
        ],
    ]);
});
