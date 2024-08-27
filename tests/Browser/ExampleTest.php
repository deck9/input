<?php

use Laravel\Dusk\Browser;
use Illuminate\Foundation\Testing\DatabaseTruncation;

uses(DatabaseTruncation::class);

test('visit the login page', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/login')
                ->assertSee('Sign In')
                ->screenshot('login');
    });
});

test('visit the register page', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/register')
                ->assertSee('Create your account')
                ->screenshot('register');

        $browser->type('#email', 'philipp@deck9.co')
                ->type('#password', 'password')
                ->screenshot('register-form')
                ->press('Register')
                ->pause(1000);

        $browser->assertRouteIs('teams.create')
            ->type('#name', 'My Input Team')
            ->screenshot('team-name')
            ->press('Create Team')
            ->pause(1000)
            ->screenshot('team-created');
    });
});
