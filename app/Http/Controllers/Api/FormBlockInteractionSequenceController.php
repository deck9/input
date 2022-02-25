<?php

namespace App\Http\Controllers\Api;

use App\Models\Form;
use App\Models\FormBlock;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class FormBlockInteractionSequenceController extends Controller
{
    public function __invoke(Request $request, FormBlock $block)
    {
        if ($request->user()->cannot('update', $block)) {
            abort(403);
        }

        $request->validate([
            'sequence' => 'required|array',
        ]);

        foreach ($request->sequence as $pos => $id) {
            $interaction = $block->interactions->firstWhere('id', $id);
            $interaction->update(['sequence' => $pos]);
        }

        return response()->json(null, 204);
    }
}
