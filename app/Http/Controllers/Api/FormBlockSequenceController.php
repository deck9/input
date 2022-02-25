<?php

namespace App\Http\Controllers\Api;

use App\Models\Form;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class FormBlockSequenceController extends Controller
{
    public function __invoke(Request $request, Form $form)
    {
        if ($request->user()->cannot('update', $form)) {
            abort(403);
        }

        $request->validate([
            'sequence' => 'required|array',
        ]);

        foreach ($request->sequence as $pos => $id) {
            $snippet = $form->blocks->firstWhere('id', $id);
            $snippet->update(['sequence' => $pos]);
        }

        return response()->json(null, 204);
    }
}
