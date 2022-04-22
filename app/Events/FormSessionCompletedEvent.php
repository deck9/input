<?php

namespace App\Events;

use App\Models\FormSession;
use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;

class FormSessionCompletedEvent
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $session;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(FormSession $session)
    {
        $this->session = $session;
    }
}
