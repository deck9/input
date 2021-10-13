<?php

namespace App\Http\Controllers\Api;

use App\Models\Form;
use App\Models\FormBlock;
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

        $blocks = $form->blocks->sortBy('sequence');

        if (!$form->has_data_privacy) {
            $blocks = $blocks->reject(function ($item) {
                return $item->type === FormBlock::CONSENT;
            });
        }

        $blocks->each(function ($block) {
            $block->interactions->each->setAppends(['responses_count']);
        });

        return response()->json($blocks->values()->toArray());
    }

    public function create(Request $request, Form $form)
    {
        if ($request->user()->cannot('update', $form)) {
            abort(403);
        }

        $sequence = $form->blocks->count();

        $block = $form->blocks()->create([
            'type' => FormBlock::MESSAGE,
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
