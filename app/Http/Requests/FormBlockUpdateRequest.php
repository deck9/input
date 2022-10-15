<?php

namespace App\Http\Requests;

use App\Models\FormBlock;
use App\Enums\FormBlockType;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Foundation\Http\FormRequest;

class FormBlockUpdateRequest extends FormRequest
{

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
            'message' => 'string|nullable',
            'webhook_url' => 'url|nullable',
            'options' => 'array|nullable',
            'title' => 'string|nullable',
            'is_required' => 'boolean|nullable',
            'type' => [new Enum(FormBlockType::class)]
        ];
    }

    public function hasMessage()
    {
        return $this->filled('message');
    }
}
