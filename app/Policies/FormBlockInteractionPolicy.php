<?php

namespace App\Policies;

use App\Models\User;
use App\Models\FormBlockInteraction;
use Illuminate\Auth\Access\HandlesAuthorization;

class FormBlockInteractionPolicy
{
    use HandlesAuthorization;

    public function show(User $user, FormBlockInteraction $interaction)
    {
        return $user->id === $interaction->block->form->user_id;
    }
}
