<?php

namespace App\Listeners;

use App\Mail\FormSubmissionNotification;
use Illuminate\Support\Facades\Mail;

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
            // the creator may have left the team, then the team owner gets the mail
            $recipient = $form->user?->belongsToTeam($form->team) ? $form->user : $form->team?->owner;

            if ($recipient) {
                Mail::to($recipient->email)
                    ->send(new FormSubmissionNotification($event->session));
            }
        }
    }
}
