<?php

use Laravel\Dusk\Browser;
use Illuminate\Foundation\Testing\DatabaseMigrations;

uses(DatabaseMigrations::class);

test('visit the login page', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/login')
                ->assertSee('Sign In')
                ->screenshot('docs/assets/screenshots/login');
    });
});

test('visit the register page', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/register')
                ->assertSee('Create your account')
                ->screenshot('docs/assets/screenshots/register');

        $browser->type('#email', 'philipp@deck9.co')
                ->type('#password', 'password')
                ->screenshot('docs/assets/screenshots/register-form')
                ->press('Register')
                ->pause(1000);

        $browser->assertRouteIs('teams.create')
            ->type('#name', 'My Input Team')
            ->screenshot('docs/assets/screenshots/team-name')
            ->press('Create Team')
            ->pause(1000)
            ->screenshot('docs/assets/screenshots/team-created');
    });
});

test('visiting the dashboard', function () {
    // Create sample forms for the dashboard
    $user = App\Models\User::where('email', 'philipp@deck9.co')->first();
    
    // Skip if user doesn't exist yet
    if (!$user) {
        $this->markTestSkipped('User not found. Run the registration test first.');
        return;
    }
    
    // Create some sample forms to show on the dashboard
    $forms = [
        [
            'name' => 'Customer Satisfaction Survey',
            'description' => 'Get feedback from your customers',
            'background_color' => '#e0f2fe',
        ],
        [
            'name' => 'Product Registration',
            'description' => 'Register new products for warranty',
            'background_color' => '#dcfce7',
        ],
        [
            'name' => 'Event Registration',
            'description' => 'Sign up for our conference',
            'background_color' => '#fef9c3',
        ]
    ];
    
    foreach ($forms as $formData) {
        App\Models\Form::factory()->create([
            'user_id' => $user->id,
            'team_id' => $user->currentTeam->id,
            'name' => $formData['name'],
            'description' => $formData['description'],
            'background_color' => $formData['background_color'],
        ]);
    }
    
    // Screenshot the dashboard with the forms
    $this->browse(function (Browser $browser) use ($user) {
        $browser->loginAs($user)
                ->visit('/dashboard')
                ->pause(1000)
                ->assertSee('Welcome')
                ->screenshot('docs/assets/screenshots/dashboard');
    });
});
