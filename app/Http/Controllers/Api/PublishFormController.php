<?php

namespace App\Http\Controllers\Api;

use App\Events\FormPublished;
use App\Http\Controllers\Controller;
use App\Models\Form;
use Knuckles\Scribe\Attributes\Authenticated;
use Knuckles\Scribe\Attributes\Group;

class PublishFormController extends Controller
{
    /**
     * Publish a form
     *
     * This endpoint publishes a form, making it visible to the public.
     */
    #[Group('Form Visibility')]
    #[Authenticated]
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
