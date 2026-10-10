<?php

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;

uses(DatabaseMigrations::class);

test('a user can log in', function () {
    $user = User::factory()->withTeam()->create();

    $this->browse(fn (Browser $browser) => $browser
        ->visit('/login')
        ->type('#email', $user->email)
        ->type('#password', 'password')
        ->press('Log in')
        ->waitForLocation('/')
        ->assertAuthenticatedAs($user));
});
