<?php

use App\Jobs\CallWebhookJob;
use App\Models\Form;
use App\Models\FormSession;
use App\Models\FormWebhook;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpClient\Response\MockResponse;
use Symfony\Contracts\HttpClient\HttpClientInterface;

uses(RefreshDatabase::class);

it('can create a database entry for a session and configured form webhook response', function () {
    app()->bind(HttpClientInterface::class, function () {
        return new MockHttpClient([
            new MockResponse(json_encode(['message' => 'Ok!'])),
        ]);
    });

    $form = Form::factory()->has(
        FormWebhook::factory()
    )->create();
    $session = FormSession::factory()->for($form)->create();

    CallWebhookJob::dispatch($session, $form->formWebhooks->first());

    $this->assertDatabaseHas('form_session_webhooks', [
        'form_session_id' => $session->id,
        'form_webhook_id' => $form->formWebhooks->first()->id,
        'status' => 200,
        'tries' => 1,
    ]);
});

it('will use the same database entry if a webhook gets called twice for the same session', function () {
    app()->bind(HttpClientInterface::class, function () {
        return new MockHttpClient([
            new MockResponse(json_encode(['message' => 'Ok!'])),
        ]);
    });

    $form = Form::factory()->has(
        FormWebhook::factory()
    )->create();
    $session = FormSession::factory()->for($form)->create();

    CallWebhookJob::dispatch($session, $form->formWebhooks->first());
    CallWebhookJob::dispatch($session, $form->formWebhooks->first());

    $this->assertDatabaseHas('form_session_webhooks', [
        'form_session_id' => $session->id,
        'form_webhook_id' => $form->formWebhooks->first()->id,
        'status' => 200,
        'tries' => 2,
    ]);
});

it('will log webhook requests that are not successful', function () {
    app()->bind(HttpClientInterface::class, function () {
        return new MockHttpClient([
            new MockResponse(json_encode(['message' => 'Ok!']), [
                'http_code' => 422,
            ]),
        ]);
    });

    $form = Form::factory()->has(
        FormWebhook::factory()
    )->create();
    $session = FormSession::factory()->for($form)->create();

    CallWebhookJob::dispatch($session, $form->formWebhooks->first());

    $this->assertDatabaseHas('form_session_webhooks', [
        'form_session_id' => $session->id,
        'form_webhook_id' => $form->formWebhooks->first()->id,
        'status' => 422,
        'tries' => 1,
    ]);
});

it('blocks webhooks to internal addresses and logs the error', function (string $url) {
    $form = Form::factory()->has(
        FormWebhook::factory(['webhook_url' => $url])
    )->create();
    $session = FormSession::factory()->for($form)->create();

    CallWebhookJob::dispatch($session, $form->formWebhooks->first());

    $log = $session->webhooks()->first();
    expect($log->status)->toBe(500)
        ->and($log->response['error'])->toContain('is blocked');
})->with([
    'loopback' => 'http://127.0.0.1/hook',
    '6to4' => 'http://[2002:7f00:1::]/hook',
    'nat64' => 'http://[64:ff9b::7f00:1]/hook',
]);

it('submissions api endpoint will include the session webhook data', function () {
    app()->bind(HttpClientInterface::class, function () {
        return new MockHttpClient([
            new MockResponse('OK!'),
        ]);
    });

    $form = Form::factory()->has(
        FormWebhook::factory()
    )->create();
    $session = FormSession::factory()->for($form)->completed()->create();

    CallWebhookJob::dispatch($session, $form->formWebhooks->first());

    $response = $this->actingAs($form->user)
        ->json('get', route('api.forms.submissions', ['form' => $form->uuid]))
        ->assertStatus(200);

    $response->assertJson([
        'data' => [
            [
                'webhooks' => [
                    [
                        'response' => 'OK!',
                        'status' => 200,
                        'tries' => 1,
                    ],
                ],
            ],
        ],
    ]);
});
