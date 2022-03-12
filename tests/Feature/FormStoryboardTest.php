<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Form;
use App\Models\FormBlock;
use App\Enums\FormBlockType;
use App\Models\FormBlockInteraction;
use App\Enums\FormBlockInteractionType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\Eloquent\Factories\Sequence;

class FormStoryboardTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function a_guest_user_can_get_the_storyboard_for_a_form()
    {
        $form = Form::factory()->create();

        $blockA = FormBlock::factory()->create([
            'form_id' => $form->id,
            'type' => FormBlockType::short,
            'sequence' => 0,
            'message' => 'Block A content',
        ]);

        FormBlockInteraction::factory()->create([
            'form_block_id' => $blockA->id,
            'type' => FormBlockInteractionType::input,
            'label' => 'Input 1'
        ]);

        $blockB = FormBlock::factory()->create([
            'form_id' => $form->id,
            'type' => FormBlockType::radio,
            'sequence' => 1,
            'message' => 'Block B content',
        ]);

        // assign that to block b, but should not be in output
        FormBlockInteraction::factory()->create([
            'form_block_id' => $blockB->id,
            'type' => FormBlockInteractionType::input,
        ]);

        FormBlockInteraction::factory()->count(4)->state(new Sequence(fn ($sequence) => [
            'form_block_id' => $blockB->id,
            'type' => FormBlockInteractionType::button,
            'label' => 'Option ' . $sequence->index,
        ]))->create();


        $response = $this->json('GET', route('api.public.forms.storyboard', ['uuid' => $form->uuid]));

        $this->assertEquals(2, $response->json('count'));
        $this->assertCount(1, $response->json('blocks.0.interactions'));
        $this->assertCount(4, $response->json('blocks.1.interactions'));
    }
}
