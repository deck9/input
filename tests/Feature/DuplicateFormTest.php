<?php

use App\Models\Form;
use App\Models\FormBlock;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can duplicate a Form Model', function () {
    $form = Form::factory()
        ->has(FormBlock::factory()->count(3)->create())
        ->create();

    $newForm = $form->duplicate('Optional new name');

    expect($newForm->name)->toBe('Optional new name');
    expect($newForm->id)->not()->toBe($form->id);

    expect($newForm->formBlocks->count())->toBe(3);
});
