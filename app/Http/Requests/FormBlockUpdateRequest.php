<?php

namespace App\Http\Requests;

use App\Enums\FormBlockType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

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
            // the editor sends the whole block back on every save, so only check a changed title (the API docs read these rules without a block)
            'title' => [Rule::excludeIf($this->input('title') === $this->route('block')?->title), 'string', 'nullable', 'max:1024'],
            'is_required' => 'boolean|nullable',
            'is_disabled' => 'boolean|nullable',
            'type' => [new Enum(FormBlockType::class)],
        ];
    }

    public function hasMessage()
    {
        return $this->filled('message');
    }
}
