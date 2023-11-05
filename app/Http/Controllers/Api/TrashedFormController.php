<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TrashedFormController extends Controller
{
    public function delete(Request $request, $form)
    {
        $formObject = $request->user()->forms()->withTrashed()->find($form);

        dd($form, $formObject);
    }

    public function restore(Request $request)
    {

    }
}
