<?php

use App\Http\Middleware\TrustHosts;
use App\Models\Form;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Route;

uses(RefreshDatabase::class);

beforeEach(function () {
    // TrustHosts is off in tests and the local env, so force it on here.
    $this->app->bind(TrustHosts::class, fn ($app) => new class($app) extends TrustHosts
    {
        protected function shouldSpecifyTrustedHosts()
        {
            return true;
        }
    });

    Notification::fake();

    Route::get('/_test/ip', fn (Request $request) => $request->ip());
});

afterEach(function () {
    // Trusted hosts are static on the request class, don't leak them into other tests.
    Request::setTrustedHosts([]);
});

test('a reset link can be requested on the app host', function () {
    $user = User::factory()->withTeam()->create();

    $this->post('/forgot-password', ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class);
});

test('a foreign host is rejected and no reset mail is sent', function () {
    $user = User::factory()->withTeam()->create();

    $this->post('http://evil.example/forgot-password', ['email' => $user->email])
        ->assertBadRequest();

    Notification::assertNothingSent();
});

test('a forged forwarded host is rejected while all proxies are trusted', function () {
    $user = User::factory()->withTeam()->create();

    $this->withHeaders(['X-Forwarded-Host' => 'evil.example'])
        ->post('/forgot-password', ['email' => $user->email])
        ->assertBadRequest();

    Notification::assertNothingSent();
});

test('any proxy is trusted when the setting is unset', function () {
    $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.9'])
        ->withHeaders(['X-Forwarded-For' => '203.0.113.7'])
        ->get('/_test/ip')
        ->assertContent('203.0.113.7');
});

test('only the listed proxies are trusted when the setting is set', function () {
    config(['trustedproxy.proxies' => '10.0.0.1, 10.0.0.2']);

    $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.2'])
        ->withHeaders(['X-Forwarded-For' => '203.0.113.7'])
        ->get('/_test/ip')
        ->assertContent('203.0.113.7');

    $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.9'])
        ->withHeaders(['X-Forwarded-For' => '203.0.113.7'])
        ->get('/_test/ip')
        ->assertContent('10.0.0.9');
});

test('a form embedded on a third-party page still loads and submits', function () {
    $form = Form::factory()->create();
    $thirdParty = ['Origin' => 'https://shop.example', 'Referer' => 'https://shop.example/contact'];

    $this->withoutVite()
        ->withHeaders($thirdParty)
        ->get(route('forms.show', ['uuid' => $form->uuid]))
        ->assertOk();

    $this->withHeaders($thirdParty)
        ->getJson(route('api.public.forms.show', $form))
        ->assertOk()
        ->assertHeader('Access-Control-Allow-Origin', 'https://shop.example');

    $token = $this->withHeaders($thirdParty)
        ->postJson(route('api.public.forms.session.create', $form))
        ->assertCreated()
        ->json('token');

    $this->withHeaders($thirdParty)
        ->postJson(route('api.public.forms.submit', $form), ['token' => $token])
        ->assertOk();
});
