<?php

namespace App\Http\Controllers\Api;

use App\Models\Form;
use App\Models\FormSession;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class DeleteFormSubmissionController extends Controller
{
    public function __invoke(Form $form, FormSession $session)
    {
        $this->authorize('update', $form);

        $session->delete();

        return response()->json(null, 204);
    }
}
