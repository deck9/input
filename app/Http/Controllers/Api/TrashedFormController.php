<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Knuckles\Scribe\Attributes\Authenticated;
use Knuckles\Scribe\Attributes\Group;

#[Group('Forms')]
#[Authenticated]
class TrashedFormController extends Controller
{
    /**
     * Permanently delete a form
     *
     * This endpoint permanently deletes a form. This action cannot be undone.
     */
    public function delete(Request $request, $form)
    {
        $model = $request->user()
            ->forms()
            ->withTrashed()
            ->where('uuid', $form)
            ->firstOrFail();

        if (! $model->trashed()) {
            return abort(422, 'You need to put the form into trash before deleting it permanently.');
        }

        $model->forceDelete();

        return response()->json([], 200);
    }

    /**
     * Restore a form
     *
     * This endpoint restores a form from trash.
     */
    public function restore(Request $request, $form)
    {
        $model = $request->user()
            ->forms()
            ->withTrashed()
            ->where('uuid', $form)
            ->firstOrFail();

        if ($model->trashed()) {
            $model->restore();
        }

        return response()->json($model);
    }
}
