<?php

namespace App\Http\Controllers\Api;

use App\Models\Form;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class FormSubmitController extends Controller
{
    public function __invoke(Request $request, $uuid)
    {
        $form = Form::where('uuid', $uuid)->firstOrFail();

        $request->validate([
            'token' => 'required|string',
            'payload' => 'required|array',
        ]);

        $form->sessions()
            ->where('token', $request->input('token'))
            ->firstOrFail()
            ->submit($request->input('payload'));

        return response()->json(null, 201);
    }
}
