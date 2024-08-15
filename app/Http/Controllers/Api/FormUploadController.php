<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormBlockInteraction;
use Illuminate\Http\Request;

class FormUploadController extends Controller
{
    public function __invoke(Request $request, Form $form)
    {
        $request->validate([
            'token' => 'required|string',
            'actionId' => 'required|string',
            'file' => 'file',
        ]);

        $interaction = FormBlockInteraction::withUuid($request->input('actionId'))
            ->firstOrFail();

        // Validate that action belongs to the form
        if ($interaction->formBlock->form->id !== $form->id) {
            abort(404, 'Action not found');
        }

        $session = $form->formSessions()
            ->where('token', $request->input('token'))
            ->firstOrFail();

        $sessionResponse = $session->formSessionResponses->where('form_block_interaction_id', $interaction->id)->first();

        $upload = $sessionResponse->saveUpload($request->file('file'));

        return response()->json($upload, 201);
    }
}
