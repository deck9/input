<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use Knuckles\Scribe\Attributes\Authenticated;
use Knuckles\Scribe\Attributes\Group;

class UnpublishFormController extends Controller
{
    /**
     * Unpublish a form
     *
     * This endpoint unpublishes a form, making it invisible to the public. As a authenticated user, you can still access the form, all other users will get a 404.
     */
    #[Group('Form Visibility')]
    #[Authenticated]
    public function __invoke(Form $form)
    {
        $this->authorize('update', $form);

        $form->update([
            'published_at' => null,
        ]);

        return response()->json($form, 200);
    }
}
