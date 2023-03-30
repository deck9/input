<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FormIntegrationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return $this->user()->can('update', $this->route('form'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'name' => 'required',
            'webhook_url' => 'required|url',
            'webhook_method' => 'required|in:GET,POST,PUT,PATCH',
            'headers' => 'array',
        ];
    }
}
