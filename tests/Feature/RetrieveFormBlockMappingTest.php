<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can_get_a_mapping_for_which_block_type_uses_which_interaction_type', function () {
    /** @var \App\Models\User $user */
    $user = User::factory()->withTeam()->create();

    $response = $this->actingAs($user)
        ->json('GET', route('api.form-blocks.mapping'))
        ->assertSuccessful();

    $response->assertJsonFragment([
        'consent' => 'consent',
        'checkbox' => 'button',
        'radio' => 'button',
        'input-short' => 'input',
        'input-email' => 'input',
        'input-link' => 'input',
        'input-number' => 'input',
        'input-phone' => 'input',
        'input-long' => 'textarea',
        'rating' => 'range',
        'scale' => 'range',
        'date' => 'date',
        'input-file' => 'file',
    ]);
});
