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
                'id' => $this->formBlock->uuid,
                'message' => strip_tags($this->formBlock->message),
                'name' => $this->formBlock->title ?? $this->formBlock->uuid,
                'value' => $this->formatValue($this->value),
                'original' => $this->formBlock->type === FormBlockType::file ? $this->appendFiles() : $this->value,
                'type' => $this->formBlock->type,
            ];
        } catch (\Exception $e) {
            return [
                'name' => '',
                'value' => '',
                'original' => '',
                'message' => '',
                'type' => '',
            ];
        }
    }

    protected function formatValue($value)
    {
        if (is_string($value)) {
            return $value;
        }

        // if numeric, format as number
        if (is_numeric($value)) {
            $options = collect($this->formBlockInteraction->options ?? []);
            $decimalPlaces = $options->has('decimalPlaces') ? $options->get('decimalPlaces') : 0;

            return number_format($value, $decimalPlaces, ',', '.');
        }

        if ($this->formBlock->type === FormBlockType::consent) {
            $accepted = $value['accepted'] ? 'yes' : 'no';

            return $value['consent'] . ': ' . $accepted;
        }

        if ($this->formBlock->type === FormBlockType::rating || $this->formBlock->type === FormBlockType::scale) {
            return $value;
        }

        if ($this->formBlock->type === FormBlockType::file) {
            return $this->formSessionUploads->map(fn ($upload) => $upload->downloadUrl)->join(', ');
        }

        return 'Unsupported value type';
    }

    protected function appendFiles()
    {
        return $this->formSessionUploads->map(function ($upload) {
            return [
                'uuid' => $upload->uuid,
                'name' => $upload->name,
                'url' => $upload->downloadUrl,
            ];
        });
    }
}
