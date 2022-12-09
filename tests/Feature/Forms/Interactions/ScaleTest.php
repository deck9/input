<?php

namespace Tests\Feature\Forms\Interactions;

use Tests\TestCase;
use App\Enums\FormBlockType;
use App\Models\FormBlockInteraction;
use App\Enums\FormBlockInteractionType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Forms\Interactions\InteractionsTestingContract;

class ScaleTest extends TestCase
{
    use RefreshDatabase, InteractionsTestingContract;

    protected $blockType = FormBlockType::scale;
    protected $interactionType = FormBlockInteractionType::range;

    /** @test @api*/
    public function can_update_options_for_range_interaction()
    {
        $interaction = FormBlockInteraction::factory()->create();

        $response = $this->actingAs($interaction->formBlock->form->user)
            ->json('post', route('api.interactions.update', $interaction), [
                'options' => [
                    'start' => 5,
                    'end' => 10,
                    'labelLeft' => 'Test Left',
                    'labelRight' => 'Test Right',
                ]
            ])
            ->assertStatus(200);

        $response->assertJsonFragment([
            'start' => 5,
            'end' => 10,
            'labelLeft' => 'Test Left',
            'labelRight' => 'Test Right',
        ]);
    }
}
