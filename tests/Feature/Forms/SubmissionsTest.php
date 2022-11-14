<?php

namespace Tests\Feature\Forms;

use Tests\TestCase;
use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormSession;
use App\Enums\FormBlockType;
use App\Models\FormSessionResponse;
use App\Models\FormBlockInteraction;
use App\Enums\FormBlockInteractionType;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SubmissionsTest extends TestCase
{
    use RefreshDatabase;


    /** @test */
    public function can_purge_all_results_for_a_form()
    {
        $form = Form::factory()->create();

        FormSession::factory()
            ->completed()
            ->times(5)
            ->for($form)
            ->create();

        $this->actingAs($form->user)
            ->json('post', route('api.forms.purge-results', ['form' => $form->uuid]));

        $this->assertCount(0, $form->fresh()->formSessions);
    }

    /** @test */
    public function can_get_all_submissions_for_a_form()
    {
        $form = Form::factory()->create();

        FormSession::factory()
            ->completed()
            ->times(5)
            ->for($form)
            ->create();

        $this->actingAs($form->user)
            ->json('get', route('api.forms.submissions', ['form' => $form->uuid]))
            ->assertStatus(200)
            ->assertJsonCount(5, 'data');
    }
}
