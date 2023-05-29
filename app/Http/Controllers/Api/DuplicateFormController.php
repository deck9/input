<?php

namespace App\Http\Controllers\Api;

use App\Models\Form;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class DuplicateFormController extends Controller
{
    public function __invoke(Request $request, Form $form)
    {
        $this->authorize('update', $form);

        $newForm = $form->duplicate($request->name ?? 'Copy of ' . $form->name);

        $request->user()->forms()->save($newForm);

        return response()->json($newForm, 201);
    }
}
