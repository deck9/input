<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use Illuminate\Http\Request;
use Knuckles\Scribe\Attributes\Authenticated;
use Knuckles\Scribe\Attributes\Group;

class FormBlockSequenceController extends Controller
{
    /**
     * Update the sequence of form blocks
     *
     * This endpoint updates the sequence of form blocks. The sequence means the order in which the blocks are returned in the storyboard.
     */
    #[Group('Form Blocks')]
    #[Authenticated]
    public function __invoke(Request $request, Form $form)
    {
        $this->authorize('update', $form);

        $request->validate([
            'sequence' => 'required|array',
        ]);

        foreach ($request->sequence as $pos => $item) {
            $block = $form->formBlocks->firstWhere('id', $item['id']);

            $block->update(['sequence' => $pos, 'parent_block' => $item['scope']]);
        }

        return response()->json(null, 204);
    }
}
