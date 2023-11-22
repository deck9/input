<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FormWebhookRequest;
use App\Http\Resources\FormWebhookResource;
use App\Models\Form;
use App\Models\FormWebhook;
use Illuminate\Http\JsonResponse;
use Knuckles\Scribe\Attributes\Authenticated;
use Knuckles\Scribe\Attributes\BodyParam;
use Knuckles\Scribe\Attributes\Group;

#[Group('Form Webhooks')]
#[Authenticated]
class FormWebhookController extends Controller
{
    /**
     * List all webhooks
     *
     * This endpoint returns all webhooks configured on a form.
     */
    public function index(Form $form): JsonResponse
    {
        $this->authorize('view', $form);

        return response()->json(FormWebhookResource::collection($form->formWebhooks));
    }

    /**
     * Create a new webhook
     *
     * This endpoint creates a new webhook for the specified form
     */
    #[BodyParam(name: 'provider', example: 'No-example', required: false, enum: ['make', 'zapier'])]
    public function create(FormWebhookRequest $request, Form $form): JsonResponse
    {
        $webhook = $form->formWebhooks()->create($request->validated());

        return response()->json(FormWebhookResource::make($webhook), 201);
    }

    /**
     * Update a webhook
     *
     * This endpoint updates a webhook for the specified form
     */
    #[BodyParam(name: 'provider', example: 'No-example', required: false, enum: ['make', 'zapier'])]
    public function update(FormWebhookRequest $request, Form $form, FormWebhook $webhook): JsonResponse
    {
        $webhook->update($request->validated());

        return response()->json(FormWebhookResource::make($webhook));
    }

    /**
     * Delete a webhook
     *
     * This endpoint deletes a webhook for the specified form
     */
    public function delete(Form $form, FormWebhook $webhook): JsonResponse
    {
        $this->authorize('update', $form);

        $webhook->delete();

        return response()->json(null, 204);
    }
}
