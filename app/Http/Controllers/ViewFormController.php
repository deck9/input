<?php

namespace App\Http\Controllers;

use App\Models\Form;
use Illuminate\Http\Request;

class ViewFormController extends Controller
{
    public function show(Request $request, $uuid)
    {
        $form = Form::withUuid($uuid)->firstOrFail();

        return response()->view('form', [
            'form' => $form,
            'flags' => [
                'iframe' => $request->input('iframe', false),
                'hideNavigation' => $request->input('hideNavigation', false),
                'hideTitle' => $request->input('hideTitle', false),
                'focusOnMount' => $request->input('focusOnMount', true),
                'alignLeft' => $request->input('alignLeft', false),
            ]
        ]);
    }
}
