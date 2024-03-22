<?php

use App\Enums\FormBlockInteractionType;
use App\Enums\FormBlockType;
use App\Models\FormBlock;
use App\Models\FormBlockInteraction;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

dataset('interactions', [
    [FormBlockType::checkbox->value, FormBlockInteractionType::button->value],
    [FormBlockType::consent->value, FormBlockInteractionType::consent->value],
    [FormBlockType::date->value, FormBlockInteractionType::date->value],
    [FormBlockType::email->value, FormBlockInteractionType::input->value],
    [FormBlockType::link->value, FormBlockInteractionType::input->value],
    [FormBlockType::long->value, FormBlockInteractionType::textarea->value],
    [FormBlockType::number->value, FormBlockInteractionType::input->value],
    [FormBlockType::phone->value, FormBlockInteractionType::input->value],
    [FormBlockType::short->value, FormBlockInteractionType::input->value],
    [FormBlockType::secret->value, FormBlockInteractionType::input->value],
    [FormBlockType::radio->value, FormBlockInteractionType::button->value],
    [FormBlockType::rating->value, FormBlockInteractionType::range->value],
    [FormBlockType::scale->value, FormBlockInteractionType::range->value],
    [FormBlockType::file->value, FormBlockInteractionType::file->value],
]);

test('can_create_an_interaction_for_block_type', function ($blockType, $interactionType) {
    $block = FormBlock::factory()->create([
        'type' => $blockType,
    ]);

    $response = $this->actingAs($block->form->user)
        ->json('post', route('api.interactions.create', $block->id), [
            'type' => $interactionType,
        ])
        ->assertStatus(201);

    $this->assertNotNull($response->json('uuid'));
    $this->assertEquals($block->id, $response->json('form_block_id'));
    $this->assertEquals($interactionType, $response->json('type'));
})->with('interactions');

test('can_update_an_interaction_of_this_type', function ($blockType, $interactionType) {
    $interaction = FormBlockInteraction::factory()->create([
        'type' => $interactionType,
    ]);

    $response = $this->actingAs($interaction->formBlock->form->user)
        ->json('post', route('api.interactions.update', $interaction->id), [
            'label' => 'Click me',
            'message' => 'This is my message',
        ]);

    $this->assertEquals('Click me', $response->json('label'));
    $this->assertEquals('This is my message', $response->json('message'));
})->with('interactions');

test('can_set_a_unique_id', function ($blockType, $interactionType) {
    $interaction = FormBlockInteraction::factory()->create([
        'type' => $interactionType,
    ]);

    $response = $this->actingAs($interaction->formBlock->form->user)
        ->json('post', route('api.interactions.update', $interaction->id), [
            'uuid' => 'i-10',
        ]);

    $this->assertEquals('i-10', $response->json('uuid'));
})->with('interactions');

test('can_delete_an_interaction_of_this_type', function ($blockType, $interactionType) {
    $interaction = FormBlockInteraction::factory()->create([
        'type' => $interactionType,
    ]);

    $this->actingAs($interaction->formBlock->form->user)
        ->json('delete', route('api.interactions.delete', $interaction->id))
        ->assertStatus(200);

    $this->assertNull($interaction->fresh());
})->with('interactions');

test('can_save_json_option_object_to_interaction', function ($blockType, $interactionType) {
    $interaction = FormBlockInteraction::factory()->create([
        'type' => $interactionType,
    ]);

    $this->actingAs($interaction->formBlock->form->user)
        ->json('post', route('api.interactions.update', $interaction->id), [
            'options' => [
                'rows' => 10,
                'max_chars' => 250,
            ],
        ])
        ->assertSuccessful();

    $this->assertEquals([
        'rows' => 10,
        'max_chars' => 250,
    ], $interaction->fresh()->options);
})->with('interactions');

test('an_interaction_can_be_made_not_editable', function ($blockType, $interactionType) {
    $interaction = FormBlockInteraction::factory()->create([
        'type' => $interactionType,
    ]);

    $this->assertTrue($interaction->fresh()->is_editable);

    $this->actingAs($interaction->formBlock->form->user)
        ->json('post', route('api.interactions.update', $interaction->id), [
            'is_editable' => false,
        ])
        ->assertSuccessful();

    $this->assertFalse($interaction->fresh()->is_editable);
})->with('interactions');

test('an_interaction_can_be_made_disabled', function ($blockType, $interactionType) {
    $interaction = FormBlockInteraction::factory()->create([
        'type' => $interactionType,
    ]);

    $this->assertFalse($interaction->fresh()->is_disabled);

    $this->actingAs($interaction->formBlock->form->user)
        ->json('post', route('api.interactions.update', $interaction->id), [
            'is_disabled' => true,
        ])
        ->assertSuccessful();

    $this->assertTrue($interaction->fresh()->is_disabled);
})->with('interactions');

test('an_interaction_can_be_named', function ($blockType, $interactionType) {
    $interaction = FormBlockInteraction::factory()->create([
        'type' => $interactionType,
    ]);

    $this->actingAs($interaction->formBlock->form->user)
        ->json('post', route('api.interactions.update', $interaction->id), [
            'name' => 'other_option',
        ])
        ->assertSuccessful();

    $this->assertEquals('other_option', $interaction->fresh()->name);
})->with('interactions');

test('label_can_be_null_when_interaction_is_not_editable', function ($blockType, $interactionType) {
    $interaction = FormBlockInteraction::factory()->create([
        'type' => $interactionType,
        'is_editable' => false,
    ]);

    $this->actingAs($interaction->formBlock->form->user)
        ->json('post', route('api.interactions.update', $interaction->id), [
            'label' => null,
            'is_editable' => false,
        ])
        ->assertSuccessful();
})->with('interactions');
