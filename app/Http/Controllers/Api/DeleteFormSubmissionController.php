<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormSession;

class DeleteFormSubmissionController extends Controller
{
    public function __invoke(Form $form, FormSession $session)
    {
        $this->authorize('update', $form);

        $session->delete();

        return response()->json(null, 204);
    }
}
