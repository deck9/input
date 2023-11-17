<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FormSessionResource;
use Illuminate\Http\Request;
use Knuckles\Scribe\Attributes\Authenticated;
use Knuckles\Scribe\Attributes\Group;

class FormSubmissionsController extends Controller
{
    /**
     * Get form submissions
     *
     * This endpoint returns all form submissions for a form.
     */
    #[Group('Form Submissions')]
    #[Authenticated]
    public function __invoke(Request $request, string $uuid)
    {
        try {
            $form = $request->user()
                ->forms()
                ->withUuid($uuid)
                ->firstOrFail();
        } catch (\Exception $e) {
            abort(401);
        }

        $resource = FormSessionResource::collection(
            $form->formSessions()->with('webhooks.webhook')->whereNotNull('is_completed')->orderBy('is_completed', 'desc')->paginate(10)
        );

        return $resource->response();
    }
}
