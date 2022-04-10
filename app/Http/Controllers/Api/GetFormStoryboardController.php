<?php

namespace App\Http\Controllers\Api;

use App\Models\Form;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class GetFormStoryboardController extends Controller
{
    public function __invoke(Form $form)
    {
        return response()->json($form->getPublicStoryboard(), 200);
    }
}
