<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FormBlockLogicRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'conditions' => 'required|array',
            'conditions.*.source' => 'required|string',
            'conditions.*.operator' => 'required|string|in:equals,equalsNot,contains,containsNot,isLowerThan,isGreaterThan',
            'conditions.*.value' => 'required|string',
            'conditions.*.chainOperator' => 'required|string|in:and,or',
            'action' => 'required|string|in:hide,show',
            'evaluate' => 'required|string|in:before,after',
        ];
    }
}
