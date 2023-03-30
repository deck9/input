<?php

namespace App\Http\Controllers\Api;

use App\Models\Form;
use Illuminate\Http\Request;
use App\Models\FormIntegration;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\FormIntegrationRequest;

class FormIntegrationController extends Controller
{
    public function create(FormIntegrationRequest $request, Form $form): JsonResponse
    {
        $integration = $form->formIntegrations()->create($request->validated());

        return response()->json($integration, 201);
    }

    public function update(FormIntegrationRequest $request, Form $form, FormIntegration $integration): JsonResponse
    {
        $integration->update($request->validated());

        return response()->json($integration);
    }

    public function delete(Form $form, FormIntegration $integration): JsonResponse
    {
        $integration->delete();

        return response()->json(null, 204);
    }
}
