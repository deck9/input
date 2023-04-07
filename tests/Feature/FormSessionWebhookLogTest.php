<?php

use App\Models\Form;
use App\Models\FormSession;
use App\Models\FormWebhook;
use App\Jobs\CallWebhookJob;
use Illuminate\Support\Facades\Http;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can create a database entry for a session and configured form webhook response', function () {
    Http::fake();

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

    Http::assertSentCount(1);
});

it('will use the same database entry if a webhook gets called twice for the same session', function () {
    Http::fake();

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

    Http::assertSentCount(2);
});

it('submissions api endpoint will include the session webhook data', function () {
    Http::fake(function () {
        return Http::response('OK!', 200);
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
