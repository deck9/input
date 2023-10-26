<?php

namespace App\Http\Controllers;

use App\Models\Form;
use Illuminate\Http\Request;

class ViewFormController extends Controller
{
    public function show(Request $request, $uuid)
    {
        $form = Form::withUuid($uuid)->firstOrFail();

        if (! $form->is_published && ! $request->user()) {
            abort(404);
        }

        if (! $form->is_published && $request->user()->id !== $form->user_id) {
            abort(404);
        }

        return response()->view('form', [
            'form' => $form,
            'ogProperties' => [
                'title' => $form->name,
                'description' => $form->description,
            ],
            'flags' => [
                'iframe' => $request->input('iframe', false),
                'hideNavigation' => $request->input('hideNavigation', false),
                'hideTitle' => $request->input('hideTitle', false),
                'focusOnMount' => $request->input('focusOnMount', true),
                'alignLeft' => $request->input('alignLeft', false),
                'spacing' => $request->input('spacing', false),
            ],
        ]);
    }
}
