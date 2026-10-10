<?php

namespace App\Http\Controllers\Api;

use App\Enums\FormBlockType;
use App\Http\Controllers\Controller;
use App\Models\Form;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
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

        $groups = $form->formBlocks->where('type', FormBlockType::group);

        // like the editor: a block can only go into a top-level group of this form, a group stays at the top level
        $request->validate([
            'sequence' => 'required|array',
            'sequence.*.id' => ['required', Rule::in($form->formBlocks->pluck('id'))],
            'sequence.*.scope' => [
                'present',
                'nullable',
                Rule::in($groups->whereNull('parent_block')->pluck('uuid')),
                function ($attribute, $value, $fail) use ($request, $groups) {
                    if ($groups->contains('id', $request->input(Str::replaceLast('scope', 'id', $attribute)))) {
                        $fail('A group can\'t go into another group.');
                    }
                },
            ],
        ]);

        foreach ($request->sequence as $pos => $item) {
            $block = $form->formBlocks->firstWhere('id', $item['id']);

            $block->update(['sequence' => $pos, 'parent_block' => $item['scope']]);
        }

        return response()->json(null, 204);
    }
}
