<?php

use App\Events\FormSessionCompletedEvent;
use App\Jobs\CallWebhookJob;
use App\Listeners\FormSubmitWebhookListener;
use App\Models\Form;
use App\Models\FormSession;
use App\Models\FormSessionResponse;
use App\Models\FormWebhook;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

it('triggers all webhooks on a form when form submit is receveid', function () {
    Queue::fake();

    $form = Form::factory()
        ->has(FormWebhook::factory([
            'webhook_method' => 'GET',
            'webhook_url' => 'https://void.work/submit',
        ]))
        ->has(FormWebhook::factory([
            'webhook_method' => 'GET',
            'webhook_url' => 'https://blackhole.wip/submit',
        ]))
        ->create();

    $session = FormSession::factory()->for($form)
        ->has(FormSessionResponse::factory([
            'value' => 'test response',
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
            'is_enabled' => false,
        ]))
        ->create();

    $session = FormSession::factory()->for($form)
        ->has(FormSessionResponse::factory([
            'value' => 'test response',
        ]))
        ->completed()
        ->create();

    // emulate the listener reacting to the FormSessionCompletedEvent
    with(new FormSubmitWebhookListener())
        ->handle(new FormSessionCompletedEvent($session));

    Queue::assertPushed(CallWebhookJob::class, 0);
});
