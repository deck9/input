<?php

namespace Tests\Feature\Forms;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class FormBlockMappingTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function can_get_a_mapping_for_which_block_type_uses_which_interaction_type()
    {
        /** @var \App\Models\User $user */
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->json('GET', route('api.form-blocks.mapping'))
            ->assertSuccessful();

        $response->assertJsonFragment([
            "consent" => "consent",
            "checkbox" => "button",
            "radio" => "button",
            "input-short" => "input",
            "input-email" => "input",
            "input-link" => "input",
            "input-number" => "input",
            "input-phone" => "input",
            "input-long" => "textarea",
            "rating" => "range",
            "scale" => "range"
        ]);
    }
}
