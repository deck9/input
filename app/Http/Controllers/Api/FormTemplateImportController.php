<?php

namespace App\Http\Controllers\Api;

use App\Models\Form;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class FormTemplateImportController extends Controller
{
    public function __invoke(Request $request, Form $form)
    {
        if ($request->user()->cannot('view', $form)) {
            abort(403);
        }

        $request->validate([
            'template' => 'required|json',
        ]);

        $form->applyTemplate($request->input('template'));

        return response()->json([
            'message' => 'Template imported successfully',
        ]);
    }
}
