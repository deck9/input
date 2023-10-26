<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

it('creates a salt when creating a new user', function () {
    $user = new User([
        'name' => 'Test',
        'email' => 'test@getinput.co',
    ]);

    $user->password = Hash::make('secret');
    $user->save();

    $this->assertNotNull($user->salt);
});
