<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use Illuminate\Http\Request;
use Knuckles\Scribe\Attributes\Group;

class FormTemplateImportController extends Controller
{
    /**
     * Import a form from template
     *
     * This endpoint imports a form from a template.
     *
     * @hideFromAPIDocumentation
     */
    #[Group('Templates')]
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
