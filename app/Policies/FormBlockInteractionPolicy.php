<?php

namespace App\Policies;

use App\Models\FormBlockInteraction;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class FormBlockInteractionPolicy
{
    use HandlesAuthorization;

    public function view(User $user, FormBlockInteraction $interaction)
    {
        return $user->id === $interaction->formBlock->form->user_id;
    }

    public function update(User $user, FormBlockInteraction $interaction)
    {
        return $user->id === $interaction->formBlock->form->user_id;
    }

    public function delete(User $user, FormBlockInteraction $interaction)
    {
        return $user->id === $interaction->formBlock->form->user_id;
    }
}
