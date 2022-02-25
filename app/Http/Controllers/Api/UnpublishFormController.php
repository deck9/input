<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Events\FormPublished;
use App\Http\Controllers\Controller;

class UnpublishFormController extends Controller
{
    public function __invoke(Request $request, $uuid)
    {
        $form = $request->user()
            ->forms()
            ->withUuid($uuid)
            ->firstOrFail();

        $form->update([
            'published_at' => null,
        ]);

        return response()->json($form, 200);
    }
}
