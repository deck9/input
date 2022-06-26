<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class FormSessionResponseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        try {
            return [
                'name' => $this->formBlock->title ?? $this->formBlock->uuid,
                'value' => $this->value
            ];
        } catch (\Exception $e) {
            return [
                'name' => '',
                'value' => ''
            ];
        }
    }
}
