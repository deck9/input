<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use Illuminate\Http\Request;

class FormBlockSequenceController extends Controller
{
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
