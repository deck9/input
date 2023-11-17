<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormSession;
use Knuckles\Scribe\Attributes\Group;

class DeleteFormSubmissionController extends Controller
{
    /**
     * Delete a single form submission
     *
     * This endpoint deletes a single form submission.
     */
    #[Group('Form Submissions')]
    public function __invoke(Form $form, FormSession $session)
    {
        $this->authorize('update', $form);

        $session->delete();

        return response()->json(null, 204);
    }
}
