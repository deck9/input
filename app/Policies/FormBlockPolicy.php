<?php

namespace App\Policies;

use App\Models\FormBlock;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class FormBlockPolicy
{
    use HandlesAuthorization;

    public function update(User $user, FormBlock $block)
    {
        return $user->id === $block->form->user_id;
    }

    public function delete(User $user, FormBlock $block)
    {
        return $user->id === $block->form->user_id;
    }
}
