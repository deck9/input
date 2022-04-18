<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class FormSessionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        $this->load('formSessionResponses.formBlock');

        return [
            'id' => substr($this->token, 0, 8),
            'started_at' => $this->created_at,
            'completed_at' => $this->getRawOriginal('is_completed'),
            'params' => json_encode($this->params),
            'responses' => FormSessionResponseResource::collection($this->formSessionResponses)->resolve(),
        ];
    }
}
