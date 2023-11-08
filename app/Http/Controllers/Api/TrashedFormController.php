<?php

namespace App\Http\Controllers\Api;

use App\Models\Form;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class TrashedFormController extends Controller
{
    public function delete(Request $request, $form)
    {
        $model = $request->user()
            ->forms()
            ->withTrashed()
            ->where('uuid', $form)
            ->firstOrFail();

        if (!$model->trashed()) {
            return abort(422, 'You need to put the form into trash before deleting it permanently.');
        }

        $model->forceDelete();

        return response()->json([], 200);
    }

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
