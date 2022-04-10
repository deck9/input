<?php

namespace App\Http\Controllers\Api;

use App\Models\Form;
use App\Models\FormSession;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class CreateFormSessionController extends Controller
{
    public function __invoke(Request $request, Form $form)
    {
        $session = FormSession::create([
            'form_id' => $form->id,
            'token' => Str::random(32),
            'params' => $request->input('params', []),
            'has_data_privacy' => $form->has_data_privacy,
        ]);

        return response()->json($session, 201);
    }
}
