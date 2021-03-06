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
        $this->authorize('update', $block);

        $request->validate([
            'sequence' => 'required|array',
        ]);

        $block->updateInteractionSequence($request->sequence);

        return response()->json(null, 204);
    }
}
