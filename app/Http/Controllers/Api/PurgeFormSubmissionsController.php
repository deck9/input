<?php

namespace App\Http\Controllers\Api;

use App\Models\Form;
use App\Http\Controllers\Controller;

class PurgeFormSubmissionsController extends Controller
{
    public function __invoke(Form $form)
    {
        $this->authorize('update', $form);

        $form->formSessions()->delete();

        return response()->json(null, 204);
    }
}
