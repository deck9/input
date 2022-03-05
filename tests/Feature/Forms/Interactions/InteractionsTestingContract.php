<?php

namespace Tests\Feature\Forms\Interactions;

use App\Snippet;
use App\Interaction;
use App\Models\FormBlock;
use App\Enums\FormBlockType;
use App\Models\FormBlockInteraction;
use App\Enums\FormBlockInteractionType;

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

        $response = $this->actingAs($interaction->block->form->user)
            ->json('post', route('api.interactions.update', $interaction->id), [
                'label' => 'Click me',
                'reply' => 'This is my reply',
            ]);

        $this->assertEquals('Click me', $response->json('label'));
        $this->assertEquals('This is my reply', $response->json('reply'));
    }

    /** @test */
    public function can_set_a_unique_id()
    {
        $interaction = FormBlockInteraction::factory()->create([
            'type' => $this->getInteractionType(),
        ]);

        $response = $this->actingAs($interaction->block->form->user)
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

        $this->actingAs($interaction->block->form->user)
            ->json('delete', route('api.interactions.delete', $interaction->id))
            ->assertStatus(200);

        $this->assertNull($interaction->fresh());
    }
}
