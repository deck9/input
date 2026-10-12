<?php

namespace App\Http\Requests;

use App\Enums\FormBlockType;
use App\Rules\MaxSize;
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
        // the editor sends the whole block back on every save, so only check a changed value (the API docs read these rules without a block)
        $changed = fn (string $key, mixed ...$rules) => [
            Rule::excludeIf($this->input($key) === $this->route('block')?->$key),
            ...$rules,
        ];

        return [
            // At most 65,535 bytes (its TEXT column), and a letter like ä takes two
            'message' => $changed('message', 'string', 'nullable', new MaxSize(65535, text: true)),
            'webhook_url' => $changed('webhook_url', 'url', 'nullable', 'max:255'),
            'options' => 'array|nullable',
            'title' => $changed('title', 'string', 'nullable', 'max:1024'),
            'is_required' => 'boolean|nullable',
            'is_disabled' => 'boolean',
            'type' => [new Enum(FormBlockType::class)],
        ];
    }

    public function hasMessage()
    {
        return $this->filled('message');
    }
}
