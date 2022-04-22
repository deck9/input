<?php

namespace App\Events;

use App\Models\Form;
use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;

class FormBlocksUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $form;

    public function __construct(Form $form)
    {
        $this->form = $form;
    }
}
