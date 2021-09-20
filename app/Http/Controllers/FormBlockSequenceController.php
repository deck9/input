<?php

namespace App\Http\Controllers;

use App\Models\Form;
use Illuminate\Http\Request;

class FormBlockSequenceController extends Controller
{
    public function update(Request $request, Form $form)
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
