<?php

namespace App\Http\Controllers\Api;

use App\Models\Form;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\PublicFormResource;

class ShowFormController extends Controller
{
    public function __invoke(Form $form)
    {
        // if (!$form->is_published) {
        //     abort(404);
        // }

        return new PublicFormResource($form);;
    }
}
