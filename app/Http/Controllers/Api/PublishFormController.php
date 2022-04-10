<?php

namespace App\Http\Controllers\Api;

use App\Models\Form;
use Illuminate\Http\Request;
use App\Events\FormPublished;
use App\Http\Controllers\Controller;

class PublishFormController extends Controller
{
    public function __invoke(Request $request, Form $form)
    {
        $this->authorize('update', $form);

        $form->update([
            'published_at' => now(),
        ]);

        event(new FormPublished($form));

        return response()->json($form, 200);
    }
}
