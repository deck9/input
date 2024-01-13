<?php

use App\Models\Form;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('as a guest or other user I cannot see an unpublished form', function () {
    $user = User::factory()->withTeam()->create();
    $otherUser = User::factory()->withTeam()->create();

    $form = Form::factory()->unpublished()->create([
        'user_id' => $user->id,
        'team_id' => $user->currentTeam->id,
    ]);

    $this->actingAs($otherUser)
        ->get(route('forms.show', $form->uuid))
        ->assertStatus(404);

    $this->get(route('forms.show', $form->uuid))
        ->assertStatus(404);
});

it('as a owner of the form or member of the same team i can preview an unpublished form', function () {
    $user = User::factory()->withTeam()->create();
    $member = User::factory()->withTeam($user->currentTeam)->create();

    $form = Form::factory()->unpublished()->create([
        'user_id' => $user->id,
        'team_id' => $user->currentTeam->id,
    ]);

    $this->actingAs($user)
        ->get(route('forms.show', $form->uuid))
        ->assertStatus(200);

    $this->actingAs($member)
        ->get(route('forms.show', $form->uuid))
        ->assertStatus(200);
});
