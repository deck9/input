<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('auto redirect to register page if no user exists in database', function () {
    $this->get('/')->assertRedirect('/login');
    $this->get('/login')->assertRedirect('/register');
});

it('do not redirect to register if user already exists', function () {
    User::factory()->withTeam()->create();

    $this->get('/login')->assertStatus(200);
});
