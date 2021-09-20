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
        return $user->id === $form->user_id;
    }

    public function update(User $user, Form $form)
    {
        return $user->id === $form->user_id;
    }

    public function delete(User $user, Form $form)
    {
        return $user->id === $form->user_id;
    }
}
