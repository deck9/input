<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PublicFormBlockInteractionResource extends JsonResource
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
            'options' => $this->options,
            'name' => $this->name,
            'label' => $this->label,
            'message' => $this->message,
            'is_editable' => $this->is_editable,
            'is_disabled' => $this->is_disabled,
        ];
    }
}
