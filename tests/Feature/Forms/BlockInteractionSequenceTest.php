<?php

namespace Tests\Feature\Forms;

use Tests\TestCase;
use App\Models\FormBlock;
use App\Models\FormBlockInteraction;
use Illuminate\Foundation\Testing\RefreshDatabase;

class BlockInteractionSequenceTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function each_block_has_a_sequence()
    {
        $block = FormBlock::factory()->create();
        $interactions = FormBlockInteraction::factory()->count(3)->create([
            'form_block_id' => $block->id,
        ]);

        $this->assertEquals(0, $interactions[0]->sequence);
        $this->assertEquals(1, $interactions[1]->sequence);
        $this->assertEquals(2, $interactions[2]->sequence);
    }

    /** @test */
    public function can_update_the_block_interactions_sequence()
    {
        $block = FormBlock::factory()->create();
        $interactions = FormBlockInteraction::factory()->count(3)->create([
            'form_block_id' => $block->id,
        ]);

        $response = $this->actingAs($block->form->user)
            ->json('POST', route('api.interactions.sequence', ['block' => $block->id]), [
                'sequence' => [
                    $interactions[2]->id,
                    $interactions[0]->id,
                    $interactions[1]->id
                ]
            ]);
        $response->assertStatus(204);

        // refresh from db
        $interactions = $interactions->fresh();

        $this->assertEquals(0, $interactions[2]->sequence);
        $this->assertEquals(1, $interactions[0]->sequence);
        $this->assertEquals(2, $interactions[1]->sequence);
    }

    /** @test */
    public function deleting_an_interaction_updates_sequence_on_remaining_interactions()
    {
        $block = FormBlock::factory()->create();
        $interactions = FormBlockInteraction::factory()->count(3)->create([
            'form_block_id' => $block->id,
        ]);

        // delete the second interaction
        $this->actingAs($block->form->user)
            ->json('DELETE', route('api.interactions.delete', $interactions[1]->id))
            ->assertStatus(200);

        // refresh from db
        $interactions = $block->interactions()->get();

        $this->assertCount(2, $interactions);
        $this->assertEquals(0, $interactions[0]->sequence);
        $this->assertEquals(1, $interactions[1]->sequence);
    }
}
