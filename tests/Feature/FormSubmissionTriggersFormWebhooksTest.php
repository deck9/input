<?php

use App\Models\Form;
use App\Models\FormSession;
use App\Models\FormWebhook;
use App\Models\FormSessionResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use App\Events\FormSessionCompletedEvent;
use App\Jobs\CallWebhookJob;
use App\Listeners\FormSubmitWebhookListener;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('triggers all webhooks on a form when form submit is receveid', function () {
    Queue::fake();

    $form = Form::factory()
        ->has(FormWebhook::factory([
            'webhook_method' => 'GET',
            'webhook_url' => 'https://void.work/submit'
        ]))
        ->has(FormWebhook::factory([
            'webhook_method' => 'GET',
            'webhook_url' => 'https://blackhole.wip/submit'
        ]))
        ->create();

    $session = FormSession::factory()->for($form)
        ->has(FormSessionResponse::factory([
            'value' => 'test response'
        ]))
        ->completed()
        ->create();

    // emulate the listener reacting to the FormSessionCompletedEvent
    with(new FormSubmitWebhookListener())
        ->handle(new FormSessionCompletedEvent($session));

    Queue::assertPushed(CallWebhookJob::class, 2);
});

it('should only dispatch enabled webhooks', function () {
    Queue::fake();

    $form = Form::factory()
        ->has(FormWebhook::factory([
            'webhook_method' => 'GET',
            'webhook_url' => 'https://void.work/submit',
            'is_enabled' => false
        ]))
        ->create();

    $session = FormSession::factory()->for($form)
        ->has(FormSessionResponse::factory([
            'value' => 'test response'
        ]))
        ->completed()
        ->create();

    // emulate the listener reacting to the FormSessionCompletedEvent
    with(new FormSubmitWebhookListener())
        ->handle(new FormSessionCompletedEvent($session));

    Queue::assertPushed(CallWebhookJob::class, 0);
});

it('submits to configured webhook url and http method', function () {
    Http::fake();

    $form = Form::factory()
        ->has(FormWebhook::factory([
            'webhook_method' => 'GET',
            'webhook_url' => 'https://void.work/submit'
        ]))->create();

    $session = FormSession::factory()->for($form)
        ->has(FormSessionResponse::factory([
            'value' => 'test response'
        ]))
        ->completed()
        ->create();

    with(new FormSubmitWebhookListener())
        ->handle(new FormSessionCompletedEvent($session));

    Http::assertSent(function ($request) use ($form) {
        $webhook = $form->formWebhooks[0];

        return $request->url() === $webhook->webhook_url
            && $request->method() === strtoupper($webhook->webhook_method);
    });
});
