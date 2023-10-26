<?php

namespace App\Http\Controllers\Api;

use App\Enums\FormBlockType;
use App\Events\FormBlocksUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\FormBlockUpdateRequest;
use App\Models\Form;
use App\Models\FormBlock;
use Illuminate\Http\Request;

class FormBlockController extends Controller
{
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
