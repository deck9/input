<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FormSubmissionsController extends Controller
{
    public function show(Request $request, string $uuid)
    {
        $form = $request->user()
            ->forms()
            ->withUuid($uuid)
            ->with('formBlocks')
            ->firstOrFail();

        $form->formBlocks->each(
            fn ($item) => $item->formBlockInteractions->each->setAppends(['responses_count'])
        );

        return response()->json([
            'blocks' => $form->formBlocks,
        ], 200);
    }
}
