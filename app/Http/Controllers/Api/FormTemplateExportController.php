<?php

namespace App\Http\Controllers\Api;

use App\Models\Form;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class FormTemplateExportController extends Controller
{
    public function __invoke(Form $form)
    {
        $this->authorize('view', $form);

        return response()->json($form->toTemplate(), 200);
    }
}
