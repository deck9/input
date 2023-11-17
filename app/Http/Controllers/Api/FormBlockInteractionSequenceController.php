<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FormBlock;
use Illuminate\Http\Request;
use Knuckles\Scribe\Attributes\Authenticated;
use Knuckles\Scribe\Attributes\Group;

class FormBlockInteractionSequenceController extends Controller
{
    /**
     * Update the sequence of form block interactions
     *
     * This endpoint updates the sequence of form block interactions. The sequence means the order in which the interacctions are returned in the storyboard
     */
    #[Group('Form Block Interactions')]
    #[Authenticated]
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
