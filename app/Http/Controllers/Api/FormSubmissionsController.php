<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\FormSessionResource;

class FormSubmissionsController extends Controller
{
    public function __invoke(Request $request, string $uuid)
    {
        $form = $request->user()
            ->forms()
            ->withUuid($uuid)
            ->firstOrFail();

        $resource = FormSessionResource::collection(
            $form->formSessions()->whereNotNull('is_completed')->orderBy('is_completed', 'desc')->paginate(15)
        );

        return $resource->response();
    }
}
