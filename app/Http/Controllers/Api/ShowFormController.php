<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublicFormResource;
use App\Models\Form;

class ShowFormController extends Controller
{
    public function __invoke(Form $form)
    {
        if (! $form->is_published) {
            abort(404);
        }

        return new PublicFormResource($form);
    }
}
