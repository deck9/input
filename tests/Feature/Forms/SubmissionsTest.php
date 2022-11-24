<?php

namespace Tests\Feature\Forms;

use App\Enums\FormBlockType;
use Tests\TestCase;
use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormSession;
use App\Models\FormSessionResponse;
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

        FormBlock::factory()
            ->input(FormBlockType::short)
            ->times(2)
            ->for($form)
            ->create();

        FormSession::factory()
            ->completed()
            ->has(FormSessionResponse::factory()->count(2))
            ->for($form)
            ->create();

        FormSession::factory()
            ->completed()
            ->has(FormSessionResponse::factory()->count(1))
            ->for($form)
            ->create();

        FormSession::factory()
            ->completed()
            ->for($form)
            ->create();

        FormSession::factory()
            ->for($form)
            ->create();

        $response = $this->actingAs($form->user)
            ->json('get', route('api.forms.submissions', ['form' => $form->uuid]))
            ->assertStatus(200);

        // assert that count of total session data is 3
        $this->assertCount(3, $response->json('data'));

        // assert that each sessions has the submitted responses
        $this->assertCount(2, $response->json('data.0.responses'));
        $this->assertCount(1, $response->json('data.1.responses'));
        $this->assertCount(0, $response->json('data.2.responses'));
    }
}
