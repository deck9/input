<?php

namespace App\Http\Controllers\Api;

use App\Models\FormBlock;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\FormBlockInteraction;
use App\Enums\FormBlockInteractionType;

class FormBlockInteractionController extends Controller
{
    public function create(FormBlock $block)
    {
        if (!$block->getInteractionType()) {
            abort(400, 'Invalid block type');
        }

        $interaction = new FormBlockInteraction([
            'type' => $block->getInteractionType(),
        ]);

        $block->interactions()->save($interaction);

        return response()->json($interaction->fresh(), 201);
    }

    public function update(Request $request, FormBlockInteraction $interaction)
    {
        switch ($interaction->type) {
            case FormBlockInteractionType::button:
                $request->validate([
                    'label' => 'min:1',
                ]);
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
