<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;

class GetFormStoryboardController extends Controller
{
    public function __invoke(Form $form)
    {
        return response()->json($form->getPublicStoryboard(), 200);
    }
}
