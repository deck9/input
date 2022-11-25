<?php

namespace Tests\Feature\Forms;

use Tests\TestCase;
use App\Models\Form;
use App\Models\FormBlock;
use App\Enums\FormBlockType;
use App\Models\FormSessionResponse;
use App\Models\FormBlockInteraction;
use Illuminate\Foundation\Testing\RefreshDatabase;

class StoryboardTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function a_guest_user_can_get_the_storyboard_for_a_form()
    {
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
            'form' => $form->uuid
        ]));

        $this->assertEquals(2, $response->json('count'));
        $this->assertCount(1, $response->json('blocks.0.interactions'));
        $this->assertCount(4, $response->json('blocks.1.interactions'));
    }
}
