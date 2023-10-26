<?php

namespace App\Events;

use App\Models\Form;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FormBlocksUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $form;

    public function __construct(Form $form)
    {
        $this->form = $form;
    }
}
