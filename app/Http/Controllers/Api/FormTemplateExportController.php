<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;

class FormTemplateExportController extends Controller
{
    public function __invoke(Form $form)
    {
        $this->authorize('view', $form);

        return response()->json($form->toTemplate(), 200);
    }
}
