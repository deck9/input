<?php

use App\Models\User;
use Laravel\Dusk\Browser;

test('a user can log in', function () {
    $user = User::factory()->withTeam()->create();

    $this->browse(fn (Browser $browser) => $browser
        ->visit('/login')
        ->waitFor('#email')
        ->type('#email', $user->email)
        ->type('#password', 'password')
        ->press('Log in')
        ->waitForLocation('/')
        ->assertAuthenticatedAs($user));
});
