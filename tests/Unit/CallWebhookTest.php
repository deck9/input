<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormSession;
use App\Enums\FormBlockType;
use App\Models\FormSessionResponse;
use App\Models\FormBlockInteraction;
use Illuminate\Support\Facades\Http;
use App\Enums\FormBlockInteractionType;
use App\Events\FormSessionCompletedEvent;
use App\Listeners\FormSubmitWebhookListener;
use App\Models\FormIntegration;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CallWebhookTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function the_webhook_jobs_submits_response_data_to_webhook_url()
    {
        Http::fake();

        $form = Form::factory()
            ->has(FormIntegration::factory([
                'webhook_method' => 'GET',
                'webhook_url' => 'https://void.work/submit'
            ]))
            ->has(
                FormBlock::factory([
                    'type' => FormBlockType::short
                ])->has(
                    FormBlockInteraction::factory([
                        'type' => FormBlockInteractionType::input
                    ])
                )
            )->create();

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
            $integration = $form->formIntegrations[0];

            return $request->url() === $integration->webhook_url
                && $request->method() === strtoupper($integration->webhook_method);
        });
    }
}
