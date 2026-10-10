<?php

namespace App\Actions;

use App\Models\Form;
use App\Models\FormBlockLogic;
use App\Models\FormSessionUpload;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ForceDeleteForms
{
    /**
     * Delete the given forms for good, with their submissions, logic rules and files.
     *
     * @param  Collection<int, Form>  $forms
     */
    public function delete(Collection $forms): void
    {
        $ofTheForms = fn ($query) => $query->whereIn('form_id', $forms->modelKeys());

        $uploads = FormSessionUpload::whereHas('formSessionResponse.formSession', $ofTheForms)->pluck('path');
        $images = $forms->pluck('avatar_path')->merge($forms->pluck('background_path'));

        DB::transaction(function () use ($forms, $ofTheForms) {
            // deleting a form cascades to its blocks, sessions and answers, but logic rules have no foreign key
            FormBlockLogic::whereHas('formBlock', $ofTheForms)->delete();
            Form::withTrashed()->whereKey($forms->modelKeys())->forceDelete();
        });

        // account deletion runs this in a transaction, a rollback must keep the files
        DB::afterCommit(function () use ($uploads, $images) {
            Storage::delete($uploads->all());
            app(DeleteUnusedFormImages::class)->delete($images);
        });
    }
}
