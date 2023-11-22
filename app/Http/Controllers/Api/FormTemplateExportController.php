<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use Knuckles\Scribe\Attributes\Group;

class FormTemplateExportController extends Controller
{
    /**
     * Export a form as template
     *
     * This endpoint returns a form as a template, which can be used to create a new form.
     *
     * @hideFromAPIDocumentation
     */
    #[Group('Templates')]
    public function __invoke(Form $form)
    {
        $this->authorize('view', $form);

        return response()->json($form->toTemplate(), 200);
    }
}
