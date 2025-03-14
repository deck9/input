<?php

use App\Models\User;
use Laravel\Dusk\Browser;
use Illuminate\Foundation\Testing\DatabaseMigrations;

uses(DatabaseMigrations::class);

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
            ->waitFor('body', 'Start by creating a form')
            ->screenshot('team-created');
    });
});

test('visiting the dashboard', function () {
    $user = User::factory()->withTeam()->create([
        'name' => 'Philipp',
        'email' => 'philipp@deck9.co'
    ]);

    // Create some sample forms to show on the dashboard
    $forms = [
        [
            'name' => 'Customer Satisfaction Survey',
            'description' => 'Get feedback from your customers',
            'brand_color' => '#e0f2fe',
        ],
        [
            'name' => 'Product Registration',
            'description' => 'Register new products for warranty',
            'brand_color' => '#dcfce7',
        ],
        [
            'name' => 'Event Registration',
            'description' => 'Sign up for our conference',
            'brand_color' => '#fef9c3',
        ]
    ];

    foreach ($forms as $formData) {
        App\Models\Form::factory()->create([
            'user_id' => $user->id,
            'team_id' => $user->currentTeam->id,
            'name' => $formData['name'],
            'description' => $formData['description'],
            'brand_color' => $formData['brand_color'],
        ]);
    }

    $this->browse(function (Browser $browser) {
        $browser
            ->refresh()
            ->waitForText('Your Forms')
            ->screenshot('dashboard');
    });
});
