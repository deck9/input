<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserModelTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function enter_a_name_for_this_test()
    {
        $user = new User([
            'name' => 'Test',
            'email' => 'test@getinput.com',
        ]);

        $user->password = Hash::make('secret');
        $user->save();

        $this->assertNotNull($user->salt);
    }
}
