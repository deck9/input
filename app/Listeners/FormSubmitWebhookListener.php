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
        $event->session->form->formIntegrations->each(function ($integration) use ($event) {
            // we should create a webhook job here with session data
            // and the integration data
            if ($integration->is_enabled) {
                $this->dispatch(new CallWebhookJob($event->session, $integration));
            }
        });
    }
}
