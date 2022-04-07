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
        if ($request->user()->cannot('view', $form)) {
            abort(403);
        }

        $blocks = $form->formBlocks->sortBy('sequence');

        if ($request->has('includeResults') && $request->input('includeResults') === 'true') {
            $blocks->each(function ($block) {
                $block->setAppends(['session_count', 'interactions']);
                $block->formBlockInteractions->each->setAppends(['responses_count']);
            });
        }

        return response()->json($blocks->values()->toArray());
    }

    public function create(Request $request, Form $form)
    {
        if ($request->user()->cannot('update', $form)) {
            abort(403);
        }

        $sequence = $form->formBlocks->count();

        $block = $form->formBlocks()->create([
            'type' => FormBlockType::none,
            'sequence' => $sequence
        ]);

        return response()->json($block->fresh(), 201);
    }

    public function update(FormBlockUpdateRequest $request, FormBlock $block)
    {
        if ($request->user()->cannot('update', $block)) {
            abort(403);
        }

        $block->update($request->validated());

        event(new FormBlocksUpdated($block->form));
        $block->makeHidden('form');

        return response()->json($block, 200);
    }

    public function delete(Request $request, FormBlock $block)
    {
        if ($request->user()->cannot('delete', $block)) {
            abort(403);
        }

        $block->delete();

        return response('', 200);
    }
}
