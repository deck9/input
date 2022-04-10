<?php

namespace App\Http\Controllers\Api;

use App\Models\Form;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class UnpublishFormController extends Controller
{
    public function __invoke(Request $request, Form $form)
    {
        $this->authorize('update', $form);

        $form->update([
            'published_at' => null,
        ]);

        return response()->json($form, 200);
    }
}
