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
        return $user->can('view', $interaction->formBlock->form);
    }

    public function update(User $user, FormBlockInteraction $interaction)
    {
        return $user->can('update', $interaction->formBlock->form);
    }

    public function delete(User $user, FormBlockInteraction $interaction)
    {
        return $user->can('update', $interaction->formBlock->form);
    }
}
