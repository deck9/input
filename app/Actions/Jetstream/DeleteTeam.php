<?php

namespace App\Actions\Jetstream;

use App\Models\FormBlockLogic;
use App\Models\FormSessionUpload;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
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
        $forms = $team->forms()->withTrashed()->get();
        $ofTheForms = fn ($query) => $query->whereIn('form_id', $forms->modelKeys());

        $files = FormSessionUpload::whereHas('formSessionResponse.formSession', $ofTheForms)
            ->pluck('path')
            ->merge($forms->pluck('avatar_path'))
            ->merge($forms->pluck('background_path'))
            ->filter();

        // deleting a form cascades to its blocks, sessions and answers, but logic rules have no foreign key
        FormBlockLogic::whereHas('formBlock', $ofTheForms)->delete();
        $team->forms()->withTrashed()->forceDelete();

        $team->purge();

        // account deletion runs this in a transaction, a rollback must keep the files
        DB::afterCommit(fn () => Storage::delete($files->all()));
    }
}
