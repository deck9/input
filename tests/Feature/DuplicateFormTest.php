<?php

use App\Models\Form;
use App\Models\FormBlock;
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

    expect($newForm->name)->toBe('Copy of ' . $form->name);
});
