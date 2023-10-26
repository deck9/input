<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;

class UnpublishFormController extends Controller
{
    public function __invoke(Form $form)
    {
        $this->authorize('update', $form);

        $form->update([
            'published_at' => null,
        ]);

        return response()->json($form, 200);
    }
}
