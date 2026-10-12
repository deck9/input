<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormSession;
use App\Rules\MaxSize;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Knuckles\Scribe\Attributes\Group;

class CreateFormSessionController extends Controller
{
    /**
     * Create a new form session
     *
     * This endpoint creates a new form session and returns the session token. This token is required to submit the form. Using the same token on multiple submissions will result in the old submission being overwritten.
     *
     * With `preview`, a member of the form's team gets the token `preview` instead. Submitting or uploading with it stores nothing, counts nothing and sends no webhooks or emails.
     */
    #[Group('Public Form Endpoints')]
    public function __invoke(Request $request, Form $form)
    {
        $request->validate([
            // params come from the form link, and nginx stops URLs at 8 KB
            'params' => ['array', 'nullable', new MaxSize(8192, json: true)],
            // only for the form's team: try the form without storing anything
            'preview' => 'boolean',
        ]);

        $session = new FormSession([
            'form_id' => $form->id,
            'token' => Str::random(32),
            'params' => $request->input('params', []),
            'has_data_privacy' => $form->has_data_privacy,
        ]);

        if ($request->boolean('preview')) {
            $this->authorize('view', $form);

            return response()->json($session->fill(['token' => FormSession::PREVIEW_TOKEN]), 201);
        }

        $session->save();

        return response()->json($session, 201);
    }
}
