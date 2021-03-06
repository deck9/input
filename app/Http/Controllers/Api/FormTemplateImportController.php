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
            'file' => 'required_without:template|file|mimetypes:application/json',
            'template' => 'required_without:file|json',
        ]);

        if ($request->has('file')) {
            $template = file_get_contents($request->file('file'));
            $form->applyTemplate($template);
        } else {
            $form->applyTemplate($request->input('template'));
        }

        return response()->json([
            'message' => 'Template imported successfully',
        ]);
    }
}
