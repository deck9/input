<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Inertia;

uses(RefreshDatabase::class);

test('the page props do not carry the user salt', function () {
    /** @var User $user */
    $user = User::factory()->withTeam()->create();
    $salt = $user->fresh()->salt;

    $this->assertNotEmpty($salt);

    $response = $this->actingAs($user)
        ->get(route('dashboard'), [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => Inertia::getVersion(),
        ])
        ->assertSuccessful();

    $props = $response->json('props');

    $this->assertArrayHasKey('id', $props['auth']['user']);
    $this->assertArrayNotHasKey('salt', $props['auth']['user']);
    $this->assertStringNotContainsString($salt, json_encode($props));
});

test('the user api does not carry the user salt', function () {
    /** @var User $user */
    $user = User::factory()->withTeam()->create();
    $salt = $user->fresh()->salt;

    $this->assertNotEmpty($salt);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/user')
        ->assertSuccessful()
        ->assertJsonPath('id', $user->id)
        ->assertJsonMissingPath('salt')
        ->assertDontSee($salt);
});
