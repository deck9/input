<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormSession;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Knuckles\Scribe\Attributes\Group;

class CreateFormSessionController extends Controller
{
    /**
     * Create a new form session
     *
     * This endpoint creates a new form session and returns the session token. This token is required to submit the form. Using the same token on multiple submissions will result in the old submission being overwritten.
     */
    #[Group('Public Form Endpoints')]
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
