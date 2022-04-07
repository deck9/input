<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FormResultsController extends Controller
{
    public function show(Request $request, string $uuid)
    {
        $form = $request->user()
            ->forms()
            ->withUuid($uuid)
            ->with('blocks')
            ->firstOrFail();

        $form->blocks->each(
            fn ($item) => $item->formBlockInteractions->each->setAppends(['responses_count'])
        );

        return response()->json([
            'blocks' => $form->blocks,
        ], 200);
    }
}
