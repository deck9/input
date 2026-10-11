<?php

use App\Enums\FormBlockInteractionType;
use App\Models\FormBlockInteraction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

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

test('allowed files must be a whole number of at least 1', function (mixed $allowedFiles) {
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
})->with([0, 'many']);

test('allowed files are stored, capped at 10', function (?int $allowedFiles, ?int $stored) {
    $interaction = FormBlockInteraction::factory()->create([
        'type' => FormBlockInteractionType::file->value,
    ]);

    $this->actingAs($interaction->formBlock->form->user)
        ->json('post', route('api.interactions.update', $interaction), [
            'options' => ['allowedFiles' => $allowedFiles, 'allowedFileSize' => 4],
        ])
        ->assertStatus(200);

    expect($interaction->fresh()->options)->toBe(['allowedFiles' => $stored, 'allowedFileSize' => 4]);
})->with([
    'within the limit' => [10, 10],
    'none' => [null, null],
    'above the limit' => [11, 10],
    'far above the limit' => [50, 10],
]);

test('the migration stores allowed files of file questions the way uploads read them', function () {
    $values = [50, 0, -1, 'abc', '', 2.5, '3', 3, null];
    $files = collect($values)->map(fn () => FormBlockInteraction::factory()->create(['type' => FormBlockInteractionType::file])->id);
    $button = FormBlockInteraction::factory()->create(['type' => FormBlockInteractionType::button])->id;
    $noLimit = FormBlockInteraction::factory()->create(['type' => FormBlockInteractionType::file, 'options' => ['allowedFileSize' => 4]])->id;

    // the values as stored before this change, written past the model's saving hook
    $store = fn (int $id, array $options) => DB::table('form_block_interactions')->where('id', $id)->update(['options' => json_encode($options)]);
    $files->each(fn (int $id, int $i) => $store($id, ['allowedFiles' => $values[$i]]));
    $store($button, ['allowedFiles' => 0]);

    (require database_path('migrations/2026_10_11_140000_normalize_allowed_files_of_file_questions.php'))->up();

    $options = fn (int $id) => json_decode(DB::table('form_block_interactions')->where('id', $id)->value('options'), true);
    expect($files->map(fn (int $id) => $options($id)['allowedFiles'])->all())->toBe([10, 10, 10, 10, 10, 2, 3, 3, null])
        ->and($options($button))->toBe(['allowedFiles' => 0])
        ->and($options($noLimit))->toBe(['allowedFileSize' => 4]);
});
