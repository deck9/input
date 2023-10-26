<?php

namespace App\Http\Controllers\Api;

use App\Enums\FormBlockInteractionType;
use App\Http\Controllers\Controller;
use App\Models\FormBlock;
use App\Models\FormBlockInteraction;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FormBlockInteractionController extends Controller
{
    public function create(Request $request, FormBlock $block)
    {
        $this->authorize('update', $block);

        $request->validate([
            'type' => ['required', Rule::in(array_map(
                fn ($i) => $i->value,
                FormBlockInteractionType::cases()
            ))],
        ]);

        $interaction = new FormBlockInteraction($request->only('type', 'name', 'is_editable', 'is_disabled'));

        $block->formBlockInteractions()->save($interaction);

        return response()->json($interaction->fresh(), 201);
    }

    public function update(Request $request, FormBlockInteraction $interaction)
    {
        $this->authorize('update', $interaction);

        switch ($interaction->type) {
            case FormBlockInteractionType::button:
                $request->validate([
                    'label' => 'exclude_if:is_editable,false|min:1',
                ]);
                break;
        }

        $interaction->fill($request->only(['label', 'message', 'uuid', 'options', 'is_editable', 'is_disabled', 'name']));
        $interaction->save();

        return response()->json($interaction, 200);
    }

    public function delete(Request $request, FormBlockInteraction $interaction)
    {
        $this->authorize('delete', $interaction);

        $interaction->delete();

        return response()->json('', 200);
    }
}
