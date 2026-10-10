<?php

use App\Enums\FormBlockType;
use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormBlockInteraction;
use App\Models\FormBlockLogic;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;

uses(DatabaseMigrations::class);

test('a respondent can fill in a form with a show rule and submit it', function () {
    $form = Form::factory()->create(['eoc_headline' => 'Thanks for your answers']);

    $pet = FormBlock::factory()->for($form)->create([
        'type' => FormBlockType::radio,
        'message' => 'Do you have a pet?',
        'sequence' => 0,
    ]);
    FormBlockInteraction::factory()->for($pet)->button()->create(['label' => 'Yes', 'sequence' => 0]);
    FormBlockInteraction::factory()->for($pet)->button()->create(['label' => 'No', 'sequence' => 1]);

    $name = FormBlock::factory()->for($form)->create([
        'type' => FormBlockType::short,
        'message' => 'What is its name?',
        'sequence' => 1,
    ]);
    FormBlockInteraction::factory()->for($name)->input()->create(['label' => 'Name']);
    FormBlockLogic::factory()->for($name)->create([
        'action' => 'show',
        'conditions' => [
            ['source' => $pet->uuid, 'operator' => 'equals', 'value' => 'Yes', 'chainOperator' => 'and'],
        ],
    ]);

    // Before "Yes", the hidden question makes this the last one, so the button says "Submit"
    $this->browse(fn (Browser $browser) => $browser
        ->visit('/'.$form->uuid)
        ->waitForText('Do you have a pet?')
        ->radio($pet->uuid, 'Yes')
        ->waitForTextIn('button[type="submit"]', 'Next')
        ->press('Next')
        ->waitForText('What is its name?')
        ->type("input[name='{$name->uuid}']", 'Mira')
        ->press('Submit')
        ->waitForText('Thanks for all your answers'));

    $session = $form->formSessions()->sole();

    expect($session->is_completed)->toBeTrue()
        ->and($session->responses()->pluck('value', 'form_block_id')->all())
        ->toBe([$pet->id => 'Yes', $name->id => 'Mira']);
});
