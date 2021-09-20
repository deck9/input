<?php

namespace Tests\Feature\Forms\Interactions;

use Tests\TestCase;
use App\Models\FormBlockInteraction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Forms\Interactions\InteractionsTestingContract;

class InputInteractionTest extends TestCase
{
    use RefreshDatabase, InteractionsTestingContract;

    protected function getInteractionType()
    {
        return FormBlockInteraction::TYPE_INPUT;
    }

    /** @test @api*/
    public function can_set_an_input_type_for_optional_validation()
    {
        $interaction = FormBlockInteraction::factory()->create([
            'type' => $this->getInteractionType(),
        ]);

        // test for email
        $response = $this->actingAs($interaction->block->form->user)
            ->json('post', route('api.interactions.update', $interaction->id), [
                'validation' => 'email',
            ]);

        $this->assertEquals('email', $response->json('has_validation'));

        // test for number
        $response = $this->actingAs($interaction->block->form->user)
            ->json('post', route('api.interactions.update', $interaction->id), [
                'validation' => 'numeric',
            ]);

        $this->assertEquals('numeric', $response->json('has_validation'));

        // test for url
        $response = $this->actingAs($interaction->block->form->user)
            ->json('post', route('api.interactions.update', $interaction->id), [
                'validation' => 'url',
            ]);

        $this->assertEquals('url', $response->json('has_validation'));

        // test for something random
        $this->actingAs($interaction->block->form->user)
            ->json('post', route('api.interactions.update', $interaction->id), [
                'validation' => 'other',
            ])
            ->assertStatus(422);
    }
}
