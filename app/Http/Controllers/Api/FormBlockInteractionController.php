<?php

namespace App\Http\Controllers\Api;

use App\Models\FormBlock;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\FormBlockInteraction;

class FormBlockInteractionController extends Controller
{
    public function create(Request $request, FormBlock $block)
    {
        $request->validate([
            'type' => 'required',
        ]);

        $interaction = new FormBlockInteraction([
            'type' => $request->input('type'),
        ]);

        $block->interactions()->save($interaction);

        return response()->json($interaction, 201);
    }

    public function update(Request $request, FormBlockInteraction $interaction)
    {
        switch ($interaction->type) {
            case FormBlockInteraction::TYPE_CLICK:
                $request->validate([
                    'label' => 'min:1',
                ]);
                break;
            case FormBlockInteraction::TYPE_INPUT:
                $request->validate([
                    'has_validation' => 'nullable|in:email,numeric,url,none',
                ]);

                if ($request->has('has_validation')) {
                    $interaction->has_validation = $request->has_validation;
                }
                break;
        }

        $interaction->fill($request->only(['label', 'reply', 'uuid']));
        $interaction->save();

        return response()->json($interaction, 200);
    }

    public function delete(Request $request, FormBlockInteraction $interaction)
    {
        $interaction->delete();

        return response()->json('', 200);
    }
}
