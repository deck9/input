<?php

namespace App\Listeners;

use Illuminate\Support\Facades\Mail;
use App\Mail\FormSubmissionNotification;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

class FormSessionNotificationListener
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(object $event): void
    {
        $form = $event->session->form;

        if ($form->is_notification_via_mail) {
            Mail::to($form->user->email)
                ->send(new FormSubmissionNotification($event->session));
        }
    }
}
