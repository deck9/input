<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use Knuckles\Scribe\Attributes\Group;

class PurgeFormSubmissionsController extends Controller
{
    /**
     * Purge all form submissions
     *
     * This endpoint purges all form submissions.
     */
    #[Group('Form Submissions')]
    public function __invoke(Form $form)
    {
        $this->authorize('update', $form);

        $form->formSessions()->delete();

        return response()->json(null, 204);
    }
}
