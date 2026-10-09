<?php

namespace App\Policies;

use App\Models\Form;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class FormPolicy
{
    use HandlesAuthorization;

    public function view(User $user, Form $form)
    {
        return $user->belongsToTeam($form->team);
    }

    public function update(User $user, Form $form)
    {
        return $user->belongsToTeam($form->team);
    }

    public function delete(User $user, Form $form)
    {
        return $user->belongsToTeam($form->team);
    }
}
