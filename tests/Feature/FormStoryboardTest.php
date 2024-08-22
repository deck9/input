<?php

use App\Enums\FormBlockType;
use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormBlockInteraction;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('a guest user can get the storyboard for a form', function () {
    $form = Form::factory()->create();

    FormBlock::factory()
        ->for($form)
        ->has(FormBlockInteraction::factory()->input())
        ->create(['type' => FormBlockType::short]);

    FormBlock::factory()->for($form)
        // assign that to block b, but should not be in output
        ->has(FormBlockInteraction::factory()->input())
        ->has(FormBlockInteraction::factory()->button()->count(4))
        ->create(['type' => FormBlockType::radio]);

    $response = $this->json('GET', route('api.public.forms.storyboard', [
        'form' => $form->uuid,
    ]));

    $this->assertEquals(2, $response->json('count'));
    $this->assertCount(1, $response->json('blocks.0.interactions'));
    $this->assertCount(4, $response->json('blocks.1.interactions'));
});

test('the storyboard should not return disabled blocks', function () {
    $form = Form::factory()->create();

    FormBlock::factory()
        ->for($form)
        ->count(2)
        ->create();

    FormBlock::factory()->for($form)
        ->create(['is_disabled' => true]);

    $response = $this->json('GET', route('api.public.forms.storyboard', [
        'form' => $form->uuid,
    ]));

    expect($response->json('count'))->toBe(2);
});

test('a disabled group should not return its children', function () {
    $form = Form::factory()->create();

    $group = FormBlock::factory()->for($form)
        ->create(['is_disabled' => true, 'type' => FormBlockType::group]);

    FormBlock::factory()
        ->for($form)
        ->count(2)
        ->create(['parent_block' => $group->uuid]);

    $response = $this->json('GET', route('api.public.forms.storyboard', [
        'form' => $form->uuid,
    ]));

    expect($response->json('count'))->toBe(0);
});


test('interactions in a storyboard are sorted by sequence', function () {
    $form = Form::factory()->create();

    FormBlock::factory()->for($form)
        ->has(FormBlockInteraction::factory(['label' => 'Button 2', 'sequence' => 2])->button())
        ->has(FormBlockInteraction::factory(['label' => 'Button 1', 'sequence' => 1])->button())
        ->has(FormBlockInteraction::factory(['label' => 'Button 3', 'sequence' => 3])->button())
        ->create(['type' => FormBlockType::checkbox]);

    $response = $this->json('GET', route('api.public.forms.storyboard', [
        'form' => $form->uuid,
    ]));

    expect($response->json('blocks.0.interactions.0.label'))->toBe('Button 1');
    expect($response->json('blocks.0.interactions.1.label'))->toBe('Button 2');
    expect($response->json('blocks.0.interactions.2.label'))->toBe('Button 3');
});

test('can get a storyboard with a custom response interaction', function () {
    $form = Form::factory()->create();

    FormBlock::factory()->for($form)
        ->has(FormBlockInteraction::factory(['label' => 'Custom Response', 'sequence' => 0])->customResponse())
        ->has(FormBlockInteraction::factory(['label' => 'Button 1'])->button())
        ->has(FormBlockInteraction::factory(['label' => 'Button 2', 'sequence' => 100])->button())
        ->create(['type' => FormBlockType::checkbox]);

    $response = $this->json('GET', route('api.public.forms.storyboard', [
        'form' => $form->uuid,
    ]));

    expect($response->json('blocks.0.interactions.0.label'))->toBe('Button 1');
    expect($response->json('blocks.0.interactions.1.label'))->toBe('Button 2');
    expect($response->json('blocks.0.interactions.2.label'))->toBe('Custom Response');
});
