<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FormSessionWebhookResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'response' => $this->response,
            'status' => $this->status,
            'tries' => $this->tries,
            'name' => $this->webhook->name,
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}
