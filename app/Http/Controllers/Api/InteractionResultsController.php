<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FormBlockInteraction;
use Illuminate\Http\Request;

class InteractionResultsController extends Controller
{
    public function show(Request $request, FormBlockInteraction $interaction)
    {
        if ($request->user()->cannot('show', $interaction)) {
            abort(403);
        }

        return response()->json(['responses' => $interaction->formSessionResponses], 200);
    }
}
