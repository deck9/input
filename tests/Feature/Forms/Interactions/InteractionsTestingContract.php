<?php

namespace Tests\Feature\Forms\Interactions;

use App\Models\FormBlock;
use App\Models\FormBlockInteraction;

trait InteractionsTestingContract
{
    protected function getBlockType()
    {
        return $this->blockType->value;
    }

    protected function getInteractionType()
    {
        return $this->interactionType->value;
    }

    /** @test */
    public function can_create_an_interaction_for_block_type()
    {
        $block = FormBlock::factory()->create([
            'type' => $this->getBlockType(),
        ]);

        $response = $this->actingAs($block->form->user)
            ->json('post', route('api.interactions.create', $block->id), [
                'type' => $this->getInteractionType(),
            ])
            ->assertStatus(201);

        $this->assertNotNull($response->json('uuid'));
        $this->assertEquals($block->id, $response->json('form_block_id'));
        $this->assertEquals($this->getInteractionType(), $response->json('type'));
    }

    /** @test */
    public function can_update_an_interaction_of_this_type()
    {
        $interaction = FormBlockInteraction::factory()->create([
            'type' => $this->getInteractionType(),
        ]);

        $response = $this->actingAs($interaction->formBlock->form->user)
            ->json('post', route('api.interactions.update', $interaction->id), [
                'label' => 'Click me',
                'message' => 'This is my message',
            ]);

        $this->assertEquals('Click me', $response->json('label'));
        $this->assertEquals('This is my message', $response->json('message'));
    }

    /** @test */
    public function can_set_a_unique_id()
    {
        $interaction = FormBlockInteraction::factory()->create([
            'type' => $this->getInteractionType(),
        ]);

        $response = $this->actingAs($interaction->formBlock->form->user)
            ->json('post', route('api.interactions.update', $interaction->id), [
                'uuid' => 'i-10',
            ]);

        $this->assertEquals('i-10', $response->json('uuid'));
    }

    /** @test */
    public function can_delete_an_interaction_of_this_type()
    {
        $interaction = FormBlockInteraction::factory()->create([
            'type' => $this->getInteractionType(),
        ]);

        $this->actingAs($interaction->formBlock->form->user)
            ->json('delete', route('api.interactions.delete', $interaction->id))
            ->assertStatus(200);

        $this->assertNull($interaction->fresh());
    }

    /** @test */
    public function can_save_json_option_object_to_interaction()
    {
        $interaction = FormBlockInteraction::factory()->create([
            'type' => $this->getInteractionType(),
        ]);

        $this->actingAs($interaction->formBlock->form->user)
            ->json('post', route('api.interactions.update', $interaction->id), [
                'options' => [
                    'rows' => 10,
                    'max_chars' => 250,
                ]
            ])
            ->assertSuccessful();

        $this->assertEquals([
            'rows' => 10,
            'max_chars' => 250,
        ], $interaction->fresh()->options);
    }

    /** @test */
    public function an_interaction_can_be_made_not_editable()
    {
        $interaction = FormBlockInteraction::factory()->create([
            'type' => $this->getInteractionType(),
        ]);

        $this->assertTrue($interaction->fresh()->is_editable);

        $this->actingAs($interaction->formBlock->form->user)
            ->json('post', route('api.interactions.update', $interaction->id), [
                'is_editable' => false,
            ])
            ->assertSuccessful();

        $this->assertFalse($interaction->fresh()->is_editable);
    }

    /** @test */
    public function an_interaction_can_be_made_disabled()
    {
        $interaction = FormBlockInteraction::factory()->create([
            'type' => $this->getInteractionType(),
        ]);

        $this->assertFalse($interaction->fresh()->is_disabled);

        $this->actingAs($interaction->formBlock->form->user)
            ->json('post', route('api.interactions.update', $interaction->id), [
                'is_disabled' => true,
            ])
            ->assertSuccessful();

        $this->assertTrue($interaction->fresh()->is_disabled);
    }

    /** @test */
    public function an_interaction_can_be_named()
    {
        $interaction = FormBlockInteraction::factory()->create([
            'type' => $this->getInteractionType(),
        ]);

        $this->actingAs($interaction->formBlock->form->user)
            ->json('post', route('api.interactions.update', $interaction->id), [
                'name' => 'other_option',
            ])
            ->assertSuccessful();

        $this->assertEquals('other_option', $interaction->fresh()->name);
    }

    /** @test */
    public function label_can_be_null_when_interaction_is_not_editable()
    {
        $interaction = FormBlockInteraction::factory()->create([
            'type' => $this->getInteractionType(),
            'is_editable' => false,
        ]);

        $this->actingAs($interaction->formBlock->form->user)
            ->json('post', route('api.interactions.update', $interaction->id), [
                'label' => null,
                'is_editable' => false,
            ])
            ->assertSuccessful();
    }
}
