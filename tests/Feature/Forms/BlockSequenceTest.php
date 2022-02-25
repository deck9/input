<?php

namespace Tests\Feature\Forms;

use Tests\TestCase;
use App\Models\Form;
use App\Models\FormBlock;
use Illuminate\Foundation\Testing\RefreshDatabase;

class BlockSequenceTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function can_change_the_sequence_of_blocks()
    {
        $form = Form::factory()->create();
        $blockA = $this->actingAs($form->user)->json('post', route('api.blocks.create', $form->id));
        $blockB = $this->actingAs($form->user)->json('post', route('api.blocks.create', $form->id));

        $this->assertEquals(0, $blockA->json('sequence'));
        $this->assertEquals(1, $blockB->json('sequence'));

        $response = $this->actingAs($form->user)
            ->json('POST', route('api.blocks.sequence', ['form' => $form->id]), [
                'sequence' => [$blockB->json('id'), $blockA->json('id')]
            ]);
        $response->assertStatus(204);

        // Now test that the sequence of the blocks is the inverse
        $blockA = FormBlock::find($blockA->json('id'));
        $blockB = FormBlock::find($blockB->json('id'));

        $this->assertEquals(1, $blockA->sequence);
        $this->assertEquals(0, $blockB->sequence);
    }
}
