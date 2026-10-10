<?php

use App\Enums\FormBlockType;
use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormBlockLogic;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can duplicate a Form Model', function () {
    $form = Form::factory()
        ->has(FormBlock::factory()->count(3))
        ->create();

    $newForm = $form->duplicate('Optional new name');

    expect($newForm->name)->toBe('Optional new name');
    expect($newForm->id)->not()->toBe($form->id);

    expect($newForm->formBlocks->count())->toBe(3);
});

it('keeps the logic rules, pointing to the blocks of the copy', function () {
    $form = Form::factory()->create();
    $question = FormBlock::factory()->create(['form_id' => $form->id, 'type' => FormBlockType::short, 'sequence' => 0]);
    $skipped = FormBlock::factory()->create(['form_id' => $form->id, 'sequence' => 1]);
    $target = FormBlock::factory()->create(['form_id' => $form->id, 'sequence' => 2]);

    FormBlockLogic::factory()->create([
        'form_block_id' => $skipped->id,
        'name' => 'Skip ahead',
        'action' => 'goto',
        'action_payload' => $target->uuid,
        'evaluate' => 'before',
        'conditions' => [['source' => $question->uuid, 'operator' => 'equals', 'value' => 'yes', 'chainOperator' => 'and']],
    ]);

    [$newQuestion, $newSkipped, $newTarget] = $form->duplicate('Copy')->formBlocks->all();
    $logic = $newSkipped->formBlockLogics->sole();

    expect($logic->only('name', 'action', 'evaluate'))->toBe(['name' => 'Skip ahead', 'action' => 'goto', 'evaluate' => 'before'])
        ->and($logic->action_payload)->toBe($newTarget->uuid)
        ->and($logic->conditions)->toBe([['source' => $newQuestion->uuid, 'operator' => 'equals', 'value' => 'yes', 'chainOperator' => 'and']]);
});

it('can duplicate via API route', function () {
    $form = Form::factory()
        ->has(FormBlock::factory()->count(3))
        ->create();

    $response = $this->actingAs($form->user)->json('POST', route('api.forms.duplicate', [
        'form' => $form->uuid,
    ]), [
        'name' => 'Optional new name',
    ])->assertStatus(201);

    $newForm = Form::find($response->json('id'));

    expect($newForm->name)->toBe('Optional new name');
    expect($newForm->id)->not()->toBe($form->id);

    expect($newForm->formBlocks->count())->toBe(3);
});

it('has a default name if no new name is provided via API', function () {
    $form = Form::factory()
        ->has(FormBlock::factory()->count(3))
        ->create();

    $response = $this->actingAs($form->user)->json('POST', route('api.forms.duplicate', [
        'form' => $form->uuid,
    ]))->assertStatus(201);

    $newForm = Form::find($response->json('id'));

    expect($newForm->name)->toBe('Copy of '.$form->name);
});
