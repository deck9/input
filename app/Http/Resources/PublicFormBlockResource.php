<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PublicFormBlockResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            'id' => $this->uuid,
            'type' => $this->type->value,
            'title' => $this->title,
            'message' => $this->message,
            'is_required' => $this->is_required,
            'interactions' => PublicFormBlockInteractionResource::collection($this->activeInteractions),
        ];
    }
}
