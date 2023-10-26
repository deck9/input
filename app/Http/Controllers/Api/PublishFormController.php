<?php

namespace App\Http\Controllers\Api;

use App\Events\FormPublished;
use App\Http\Controllers\Controller;
use App\Models\Form;

class PublishFormController extends Controller
{
    public function __invoke(Form $form)
    {
        $this->authorize('update', $form);

        $form->update([
            'published_at' => now(),
        ]);

        event(new FormPublished($form));

        return response()->json($form, 200);
    }
}
