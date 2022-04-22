<?php

namespace App\Listeners;

use App\Http\Resources\FormSessionResource;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class FormSubmitWebhookListener
{
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

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

        $payload = FormSessionResource::make($event->session)->resolve();

        dd($payload);

        dd($form->submit_method, $form->submit_webhook);
        dd('asdf');
    }
}
