<?php

namespace Tests\Feature\Forms\Interactions;

use Tests\TestCase;
use App\Enums\FormBlockType;
use App\Models\FormBlockInteraction;
use App\Enums\FormBlockInteractionType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Forms\Interactions\InteractionsTestingContract;

class RadioTest extends TestCase
{
    use RefreshDatabase, InteractionsTestingContract;

    protected $blockType = FormBlockType::radio;
    protected $interactionType = FormBlockInteractionType::button;

    /** @test @api*/
    public function can_not_update_interaction_with_empty_label()
    {
        $interaction = FormBlockInteraction::factory()->create();

        $this->actingAs($interaction->block->form->user)
            ->json('post', route('api.interactions.update', $interaction), [
                'label' => ''
            ])
            ->assertStatus(422);

        $this->actingAs($interaction->block->form->user)
            ->json('post', route('api.interactions.update', $interaction), [
                'label' => NULL,
            ])
            ->assertStatus(422);
    }
}
