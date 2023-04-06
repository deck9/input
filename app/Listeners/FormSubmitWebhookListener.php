<?php

namespace App\Listeners;

use App\Jobs\CallWebhookJob;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\DispatchesJobs;

class FormSubmitWebhookListener implements ShouldQueue
{
    use InteractsWithQueue;
    use DispatchesJobs;

    /**
     * Handle the event.
     *
     * @param  object  $event
     * @return void
     */
    public function handle($event)
    {
        $event->session->form->formWebhooks->each(function ($webhook) use ($event) {
            // we should create a webhook job here with session data
            // and the webhook data
            if ($webhook->is_enabled) {
                $this->dispatch(new CallWebhookJob($event->session, $webhook));
            }
        });
    }
}
