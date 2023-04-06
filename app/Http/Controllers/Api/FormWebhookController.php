<?php

namespace App\Http\Controllers\Api;

use App\Models\Form;
use App\Models\FormWebhook;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\FormWebhookRequest;
use App\Http\Resources\FormWebhookResource;

class FormWebhookController extends Controller
{
    public function index(Form $form): JsonResponse
    {
        $this->authorize('view', $form);

        return response()->json(FormWebhookResource::collection($form->formWebhooks));
    }

    public function create(FormWebhookRequest $request, Form $form): JsonResponse
    {
        $webhook = $form->formWebhooks()->create($request->validated());

        return response()->json(FormWebhookResource::make($webhook), 201);
    }

    public function update(FormWebhookRequest $request, Form $form, FormWebhook $webhook): JsonResponse
    {
        $webhook->update($request->validated());

        return response()->json(FormWebhookResource::make($webhook));
    }

    public function delete(Form $form, FormWebhook $webhook): JsonResponse
    {
        $this->authorize('update', $form);

        $webhook->delete();

        return response()->json(null, 204);
    }
}
