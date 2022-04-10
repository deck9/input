<?php

namespace App\Http\Controllers\Api;

use App\Models\Form;
use App\Models\FormBlock;
use App\Enums\FormBlockType;
use Illuminate\Http\Request;
use App\Events\FormBlocksUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\FormBlockUpdateRequest;

class FormBlockController extends Controller
{
    public function index(Request $request, Form $form)
    {
        $this->authorize('view', $form);

        $blocks = $form->formBlocks->sortBy('sequence');

        if ($request->has('includeResults') && $request->input('includeResults') === 'true') {
            $blocks->each(function ($block) {
                $block->setAppends(['session_count', 'interactions']);
                $block->formBlockInteractions->each->setAppends(['responses_count']);
            });
        }

        return response()->json($blocks->values()->toArray());
    }

    public function create(Form $form)
    {
        $this->authorize('update', $form);

        $sequence = $form->formBlocks->count();

        $block = $form->formBlocks()->create([
            'type' => FormBlockType::none,
            'sequence' => $sequence
        ]);

        return response()->json($block->fresh(), 201);
    }

    public function update(FormBlockUpdateRequest $request, FormBlock $block)
    {
        $this->authorize('update', $block);

        $block->update($request->validated());

        event(new FormBlocksUpdated($block->form));
        $block->makeHidden('form');

        return response()->json($block, 200);
    }

    public function delete(Request $request, FormBlock $block)
    {
        $this->authorize('delete', $block);

        $block->delete();

        return response('', 200);
    }
}
