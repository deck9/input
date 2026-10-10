<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('the dusk login route does not log anyone in outside local', function () {
    $user = User::factory()->create();

    $this->get("/_dusk/login/{$user->id}")->assertNotFound();

    $this->assertGuest();
});
