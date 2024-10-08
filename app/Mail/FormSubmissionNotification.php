<?php

namespace App\Mail;

use App\Http\Resources\FormSessionResource;
use App\Models\FormSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class FormSubmissionNotification extends Mailable implements ShouldQueue
{
    use Queueable;
    use SerializesModels;

    public $session;

    public $form;

    /**
     * Create a new message instance.
     */
    public function __construct(FormSession $session)
    {
        $resource = new FormSessionResource($session);
        $this->session = $resource->resolve();
        $this->form = $session->form;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'You got a new form submission!',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.form-submitted',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
