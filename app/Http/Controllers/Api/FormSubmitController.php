<?php

namespace App\Http\Controllers\Api;

use App\Events\FormSessionCompletedEvent;
use App\Http\Controllers\Controller;
use App\Models\Form;
use Illuminate\Http\Request;

class FormSubmitController extends Controller
{
    public function __invoke(Request $request, Form $form)
    {
        $request->validate([
            'token' => 'required|string',
            'payload' => 'array',
        ]);

        $session = $form->formSessions()
            ->where('token', $request->input('token'))
            ->firstOrFail()
            ->submit($request->input('payload'));

        event(new FormSessionCompletedEvent($session));

        return response()->json($session, 200);
    }
}
