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

test('allowed files must be a whole number from 1 to 10', function (mixed $allowedFiles) {
    $interaction = FormBlockInteraction::factory()->create([
        'type' => FormBlockInteractionType::file->value,
        'options' => ['allowedFiles' => 2],
    ]);

    $this->actingAs($interaction->formBlock->form->user)
        ->json('post', route('api.interactions.update', $interaction), [
            'options' => ['allowedFiles' => $allowedFiles],
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('options.allowedFiles');

    expect($interaction->fresh()->options['allowedFiles'])->toBe(2);
})->with([11, 50, 0, 'many']);

test('allowed files up to 10 or none are stored', function (?int $allowedFiles) {
    $interaction = FormBlockInteraction::factory()->create([
        'type' => FormBlockInteractionType::file->value,
    ]);

    $this->actingAs($interaction->formBlock->form->user)
        ->json('post', route('api.interactions.update', $interaction), [
            'options' => ['allowedFiles' => $allowedFiles],
        ])
        ->assertStatus(200);

    expect($interaction->fresh()->options['allowedFiles'])->toBe($allowedFiles);
})->with([10, null]);
