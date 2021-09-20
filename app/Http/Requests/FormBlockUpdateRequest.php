<?php

namespace App\Http\Requests;

use App\Models\FormBlock;
use Illuminate\Foundation\Http\FormRequest;

class FormBlockUpdateRequest extends FormRequest
{
    const VALID_TYPES = [
        FormBlock::MESSAGE,
        FormBlock::CLICK,
        FormBlock::INPUT,
        FormBlock::MULTIPLE,
    ];

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'message' => 'string',
            'webhook_url' => 'url',
            'options' => 'array',
            'title' => 'string|nullable',
            'type' => [function ($attribute, $value, $fail) {
                if (!in_array($value, self::VALID_TYPES)) {
                    $fail('Snippet Type is not allowed');
                }
            }]
        ];
    }

    public function hasMessage()
    {
        return $this->filled('message');
    }

    public function hasResponses()
    {
        return $this->exists('responses') && !empty($this->input('responses'));
    }
}
