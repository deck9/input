<?php

namespace App\Http\Controllers\Api;

use App\Enums\FormBlockType;
use App\Events\FormBlocksUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\FormBlockUpdateRequest;
use App\Models\Form;
use App\Models\FormBlock;
use Illuminate\Http\Request;
use Knuckles\Scribe\Attributes\Authenticated;
use Knuckles\Scribe\Attributes\Group;

#[Group('Form Blocks')]
#[Authenticated]
class FormBlockController extends Controller
{
    /**
     * Get all form blocks
     *
     * This endpoint returns all form blocks of a form. A form block is like a single page on the form. Each block has a type that can contain different block interactions based on that type.
     */
    public function index(Request $request, Form $form)
    {
        $this->authorize('view', $form);

        $blocks = $form->formBlocks->sortBy('sequence');

        if ($request->has('includeSubmissions') && $request->input('includeSubmissions') === 'true') {
            $blocks->each(function ($block) {
                $block->setAppends(['session_count', 'interactions']);
                $block->formBlockInteractions->each->setAppends(['responses_count']);
            });
        }

        return response()->json($blocks->values()->toArray());
    }

    /**
     * Create a form block
     *
     * This endpoint creates a new form block for the specified form.
     */
    public function create(Form $form, Request $request)
    {
        $this->authorize('update', $form);

        $request->validate([
            'type' => 'nullable|in:'.collect(FormBlockType::cases())->pluck('value')->join(','),
        ]);

        $sequence = $form->formBlocks->count();

        $block = $form->formBlocks()->create([
            'type' => $request->input('type') ?? FormBlockType::none,
            'sequence' => $sequence,
        ]);

        return response()->json($block->fresh(), 201);
    }

    /**
     * Update a form block
     *
     * This endpoint updates a form block for the specified form.
     */
    public function update(FormBlockUpdateRequest $request, FormBlock $block)
    {
        $this->authorize('update', $block);

        $block->update($request->validated());

        event(new FormBlocksUpdated($block->form));
        $block->makeHidden('form');

        return response()->json($block, 200);
    }

    /**
     * Delete a form block
     *
     * This endpoint deletes a form block for the specified form.
     */
    public function delete(Request $request, FormBlock $block)
    {
        $this->authorize('delete', $block);

        $block->delete();

        return response('', 200);
    }
}
