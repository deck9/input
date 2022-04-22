<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Form;
use App\Jobs\CallWebhook;
use App\Models\FormBlock;
use App\Models\FormSession;
use App\Enums\FormBlockType;
use App\Models\FormSessionResponse;
use App\Models\FormBlockInteraction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Event;
use App\Enums\FormBlockInteractionType;
use App\Events\FormSessionCompletedEvent;
use App\Listeners\FormSubmitWebhookListener;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CallWebhookTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function the_webhook_jobs_submits_response_data_to_webhook_url()
    {
        Http::fake();

        $form = Form::factory()->has(
            FormBlock::factory([
                'type' => FormBlockType::short
            ])->has(FormBlockInteraction::factory([
                'type' => FormBlockInteractionType::input
            ]))
        )->create([
            'submit_method' => 'get',
            'submit_webhook' => 'https://void.work/submit'
        ]);

        $block = $form->formBlocks->first();
        $action = $block->formBlockInteractions->first();

        $session = FormSession::factory()->for($form)
            ->has(FormSessionResponse::factory([
                'value' => 'test response'
            ])->for($block)->for($action))
            ->completed()
            ->create();

        with(new FormSubmitWebhookListener)
            ->handle(new FormSessionCompletedEvent($session));

        Http::assertSent(function ($request) use ($form) {
            return $request->url() === $form->submit_webhook
                && $request->method() === strtoupper($form->submit_method);
        });
    }
}
