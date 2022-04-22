<?php

namespace App\Listeners;

use Illuminate\Pipeline\Pipeline;
use Illuminate\Queue\InteractsWithQueue;
use App\Http\Resources\FormSessionResource;
use App\Pipes\MergeResponsesIntoSession;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Http;

class FormSubmitWebhookListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     *
     * @param  object  $event
     * @return void
     */
    public function handle($event)
    {
        // check if form has webhook settings
        $form = $event->session->form;

        if (!$form->submit_method || !$form->submit_webhook) {
            return;
        }

        $payload = app(Pipeline::class)
            ->send(FormSessionResource::make($event->session)->resolve())
            ->through([
                MergeResponsesIntoSession::class
            ])
            ->thenReturn();

        $response = Http::send($form->submit_method, $form->submit_webhook, [
            'data' => $payload
        ]);

        $event->session->update([
            'webhook_submit_status' => $response->status(),
        ]);
    }
}
