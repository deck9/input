<?php

namespace App\Http\Resources;

use App\Enums\FormBlockType;
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
                'value' => $this->formatValue($this->value),
                'original' => $this->value,
            ];
        } catch (\Exception $e) {
            return [
                'name' => '',
                'value' => '',
                'original' => ''
            ];
        }
    }

    protected function formatValue($value)
    {
        if (is_string($value)) {
            return $value;
        }

        if ($this->formBlock->type === FormBlockType::consent) {
            $accepted = $value['accepted'] ? 'yes' : 'no';
            return $value['consent'] . ': ' . $accepted;
        }

        return 'Unsupported value type';
    }
}
