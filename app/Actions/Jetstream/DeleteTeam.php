<?php

namespace App\Actions\Jetstream;

use App\Actions\ForceDeleteForms;
use Laravel\Jetstream\Contracts\DeletesTeams;

class DeleteTeam implements DeletesTeams
{
    /**
     * Delete the given team, with its forms, their submissions and files.
     *
     * @param  mixed  $team
     * @return void
     */
    public function delete($team)
    {
        app(ForceDeleteForms::class)->delete($team->forms()->withTrashed()->get());

        $team->purge();
    }
}
