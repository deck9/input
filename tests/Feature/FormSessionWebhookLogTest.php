<?php

use App\Jobs\CallWebhookJob;
use App\Models\Form;
use App\Models\FormSession;
use App\Models\FormWebhook;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
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
        ->and($log->response['error'])->toBe('The webhook URL could not be reached.');
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

function sessionWithWebhook(array $attributes = []): array
{
    $form = Form::factory()->has(FormWebhook::factory($attributes))->create();

    return [FormSession::factory()->for($form)->create(), $form->formWebhooks->first()];
}

it('stops waiting for a webhook after 10 seconds', function () {
    $response = new MockResponse('OK');
    app()->instance(HttpClientInterface::class, new MockHttpClient($response));
    [$session, $webhook] = sessionWithWebhook();

    CallWebhookJob::dispatch($session, $webhook);

    expect($response->getRequestOptions()['max_duration'])->toEqual(10);
});

it('sends the configured headers with the webhook request', function () {
    $response = new MockResponse('OK');
    app()->instance(HttpClientInterface::class, new MockHttpClient($response));
    [$session, $webhook] = sessionWithWebhook([
        'headers' => ['Authorization' => 'Bearer secret', 'X-Api-Key' => 'key'],
    ]);

    CallWebhookJob::dispatch($session, $webhook);

    expect($response->getRequestOptions()['normalized_headers'])->toMatchArray([
        'authorization' => ['Authorization: Bearer secret'],
        'x-api-key' => ['X-Api-Key: key'],
    ]);
});

it('fails the job on a server or connection error and logs it', function (MockResponse $response, int $status) {
    app()->instance(HttpClientInterface::class, new MockHttpClient($response));
    [$session, $webhook] = sessionWithWebhook();

    expect(fn () => app()->call([new CallWebhookJob($session, $webhook), 'handle']))
        ->toThrow(Exception::class);

    expect($session->webhooks()->first()->status)->toBe($status);
})->with([
    'server error' => [new MockResponse('down', ['http_code' => 503]), 503],
    'connection error' => [new MockResponse('', ['error' => 'Connection refused']), 500],
]);

it('does not retry a webhook the receiver rejected', function () {
    app()->instance(HttpClientInterface::class, new MockHttpClient(new MockResponse('no', ['http_code' => 401])));
    [$session, $webhook] = sessionWithWebhook();

    app()->call([new CallWebhookJob($session, $webhook), 'handle']);

    expect($session->webhooks()->first()->status)->toBe(401);
});

it('retries a failing webhook 5 times with a backoff, then marks it failed', function () {
    config(['queue.default' => 'database']);
    $this->freezeTime();
    app()->bind(HttpClientInterface::class, fn () => new MockHttpClient(new MockResponse('down', ['http_code' => 503])));
    [$session, $webhook] = sessionWithWebhook();

    CallWebhookJob::dispatch($session, $webhook);

    foreach ([60, 300, 900, 3600] as $wait) {
        $this->artisan('queue:work', ['--once' => true]);

        expect(DB::table('jobs')->value('available_at'))->toBe(now()->addSeconds($wait)->getTimestamp());
        $this->travel($wait)->seconds();
    }

    $this->artisan('queue:work', ['--once' => true]);

    expect(DB::table('jobs')->count())->toBe(0)
        ->and(DB::table('failed_jobs')->count())->toBe(1);
});

it('keeps the submit working on the sync queue when a webhook fails', function () {
    app()->instance(HttpClientInterface::class, new MockHttpClient(new MockResponse('down', ['http_code' => 503])));
    [$session, $webhook] = sessionWithWebhook();

    $this->json('POST', route('api.public.forms.submit', ['form' => $session->form->uuid]), [
        'token' => $session->token,
        'payload' => [],
    ])->assertStatus(200);

    expect($session->webhooks()->first()->status)->toBe(503);
});
