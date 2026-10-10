<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FormTemplateRequest;
use App\Models\Form;
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
    public function __invoke(FormTemplateRequest $request, Form $form)
    {
        // the import replaces all questions, and their answers would go with them
        if ($form->formSessionResponses()->exists()) {
            abort(422, 'This form already has submissions. Import the template into a new form instead.');
        }

        $form->applyTemplate($request->template());

        return response()->json([
            'message' => 'Template imported successfully',
        ]);
    }
}
