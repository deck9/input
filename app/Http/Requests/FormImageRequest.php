<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FormImageRequest extends FormRequest
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
            'image' => 'required|image|max:4096',
            'type' => 'required|in:avatar,background',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array
     */
    public function attributes()
    {
        return [
            'image' => 'image',
        ];
    }
}
