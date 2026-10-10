<?php

use App\Enums\FormBlockType;
use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormBlockInteraction;
use App\Models\FormSession;
use App\Models\FormSessionResponse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

function exportCsv(Form $form): array
{
    $content = test()->actingAs($form->user)
        ->get(route('forms.submissions-export', $form))
        ->assertOk()
        ->streamedContent();

    $lines = explode("\n", trim(substr($content, 3)));

    return array_map(fn ($line) => str_getcsv($line), $lines);
}

function answer(FormSession $session, FormBlock $block, $value): FormSessionResponse
{
    return FormSessionResponse::factory()->create([
        'form_session_id' => $session->id,
        'form_block_id' => $block->id,
        'form_block_interaction_id' => $block->formBlockInteractions[0]->id,
        'value' => $value,
    ]);
}

test('can_download_an_export_of_form_results', function () {
    $form = Form::factory()->create(['name' => 'Test Form']);

    $blockA = FormBlock::factory()
        ->for($form)
        ->has(FormBlockInteraction::factory()->input())
        ->create(['type' => FormBlockType::short]);

    $blockB = FormBlock::factory()->for($form)
        ->has(FormBlockInteraction::factory()->button()->count(4))
        ->create(['type' => FormBlockType::radio]);

    $session = FormSession::factory()
        ->for($form)->completed()->create();

    FormSessionResponse::factory()
        ->for($session)
        ->for($blockA->interactions[0])
        ->create([
            'value' => 'foo',
        ]);

    FormSessionResponse::factory()
        ->for($session)
        ->for($blockB->interactions[0])
        ->create([
            'value' => $blockB->interactions[0]->label,
        ]);

    $response = $this->actingAs($form->user)
        ->json('GET', route('forms.submissions-export', $form))
        ->assertOk();

    $response->assertDownload('test-form.results.csv');
});

test('export_has_a_row_per_completed_session_and_a_column_per_question', function () {
    $form = Form::factory()->create();
    $name = FormBlock::factory()->for($form)
        ->has(FormBlockInteraction::factory()->input())
        ->create(['type' => FormBlockType::short, 'sequence' => 0]);
    $color = FormBlock::factory()->for($form)
        ->has(FormBlockInteraction::factory()->button())
        ->create(['type' => FormBlockType::radio, 'sequence' => 1]);

    $first = FormSession::factory()->for($form)->completed()->create(['params' => ['utm' => 'mail']]);
    answer($first, $name, 'Ada');
    answer($first, $color, 'Red');

    $second = FormSession::factory()->for($form)->completed()->create();
    answer($second, $name, 'Bob');

    $open = FormSession::factory()->for($form)->create();
    answer($open, $name, 'Not submitted');

    $csv = exportCsv($form);

    expect($csv)->toHaveCount(3)
        ->and($csv[0])->toBe(['uid', 'form', 'started_at', 'completed_at', 'params', $name->uuid, $color->uuid])
        ->and($csv[1])->toBe([
            $first->token, $form->uuid, $first->created_at->toDateTimeString(),
            (string) $first->getRawOriginal('is_completed'), '{"utm":"mail"}', 'Ada', 'Red',
        ])
        ->and($csv[2])->toBe([
            $second->token, $form->uuid, $second->created_at->toDateTimeString(),
            (string) $second->getRawOriginal('is_completed'), '', 'Bob', '',
        ]);
});

test('export_of_a_form_without_submissions_has_the_header_row', function () {
    $form = Form::factory()->create();
    $name = FormBlock::factory()->for($form)
        ->has(FormBlockInteraction::factory()->input())
        ->create(['type' => FormBlockType::short]);
    FormBlock::factory()->for($form)->create(['type' => FormBlockType::none]);

    expect(exportCsv($form))->toBe([
        ['uid', 'form', 'started_at', 'completed_at', 'params', $name->uuid],
    ]);
});

test('export_prefixes_cells_that_start_with_a_formula_character', function () {
    $form = Form::factory()->create();
    $block = FormBlock::factory()->for($form)
        ->has(FormBlockInteraction::factory()->input())
        ->create(['type' => FormBlockType::short]);

    foreach (['=HYPERLINK("https://evil.test")', '+1', '-1', '@SUM(A1)', 'safe'] as $value) {
        answer(FormSession::factory()->for($form)->completed()->create(), $block, $value);
    }

    expect(array_column(array_slice(exportCsv($form), 1), 5))->toBe([
        '\'=HYPERLINK("https://evil.test")', "'+1", "'-1", "'@SUM(A1)", 'safe',
    ]);
});

test('export_of_10000_submissions_stays_under_128_mb', function () {
    // answers are stored encrypted, as in production
    config(['app.debug' => false]);

    $form = Form::factory()->create();
    $blocks = FormBlock::factory()->count(10)->for($form)
        ->has(FormBlockInteraction::factory()->input())
        ->create(['type' => FormBlockType::short]);
    $value = (new FormSessionResponse(['value' => str_repeat('an answer ', 5)]))->getAttributes()['value'];
    $now = now()->toDateTimeString();

    foreach (range(1, 10) as $chunk) {
        DB::table('form_sessions')->insert(array_map(fn () => [
            'form_id' => $form->id,
            'token' => Str::random(32),
            'is_completed' => $now,
            'created_at' => $now,
            'updated_at' => $now,
        ], range(1, 1000)));
    }

    foreach (DB::table('form_sessions')->where('form_id', $form->id)->pluck('id')->chunk(100) as $sessionIds) {
        DB::table('form_session_responses')->insert($sessionIds->crossJoin($blocks)->map(fn ($pair) => [
            'form_session_id' => $pair[0],
            'form_block_id' => $pair[1]->id,
            'form_block_interaction_id' => $pair[1]->formBlockInteractions[0]->id,
            'value' => $value,
            'created_at' => $now,
            'updated_at' => $now,
        ])->all());
    }

    memory_reset_peak_usage();
    $before = memory_get_usage();

    $content = $this->actingAs($form->user)
        ->get(route('forms.submissions-export', $form))
        ->streamedContent();

    // only what the export adds: a request starts at about 30 MB, the limit is 128 MB
    expect(substr_count($content, "\n"))->toBe(10001)
        ->and(memory_get_peak_usage() - $before)->toBeLessThan(64 * 1024 * 1024);
});
