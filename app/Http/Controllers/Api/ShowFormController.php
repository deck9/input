<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublicFormResource;
use App\Models\Form;
use Knuckles\Scribe\Attributes\Group;

class ShowFormController extends Controller
{
    /**
     * Get a form
     *
     * This endpoint returns all meta data of a form, like title, description and settings.
     */
    #[Group('Public Form Endpoints')]
    public function __invoke(Form $form)
    {
        if (!$form->is_published) {
            abort(404);
        }

        return new PublicFormResource($form);
    }
}
