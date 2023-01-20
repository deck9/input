<?php

namespace Tests\Feature\Forms;

use App\Enums\FormBlockType;
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
        $form = Form::factory()
            ->has(FormBlock::factory(['sequence' => 0]))
            ->has(FormBlock::factory(['sequence' => 1]))
            ->create();

        $this->assertEquals(0, $form->formBlocks[0]->sequence);
        $this->assertEquals(1, $form->formBlocks[1]->sequence);

        $this->actingAs($form->user)
            ->json('POST', route('api.blocks.sequence', ['form' => $form->uuid]), [
                'sequence' => [
                    ["id" => $form->formBlocks[1]->id, "scope" => null],
                    ["id" => $form->formBlocks[0]->id, "scope" => null]
                ]
            ])->assertStatus(204);

        // Now test that the sequence of the blocks is the inverse
        $this->assertEquals(1, $form->formBlocks[0]->fresh()->sequence);
        $this->assertEquals(0, $form->formBlocks[1]->fresh()->sequence);
    }

    /** @test */
    public function can_add_a_scope_to_blocks()
    {
        $form = Form::factory()
            ->has(FormBlock::factory(['sequence' => 0, 'type' => FormBlockType::group]))
            ->has(FormBlock::factory(['sequence' => 1]))
            ->create();

        $this->assertEquals(0, $form->formBlocks[0]->sequence);
        $this->assertEquals(1, $form->formBlocks[1]->sequence);

        $this->actingAs($form->user)
            ->json('POST', route('api.blocks.sequence', ['form' => $form->uuid]), [
                'sequence' => [
                    ["id" => $form->formBlocks[0]->id, "scope" => null],
                    ["id" => $form->formBlocks[1]->id, "scope" => $form->formBlocks[0]->uuid]
                ]
            ])->assertStatus(204);

        // Now test that the sequence of the blocks is the inverse
        $this->assertEquals(0, $form->formBlocks[0]->fresh()->sequence);
        $this->assertEquals(1, $form->formBlocks[1]->fresh()->sequence);
        $this->assertEquals($form->formBlocks[0]->uuid, $form->formBlocks[1]->fresh()->parent_block);
    }
}
