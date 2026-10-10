<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FormWebhookRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        $webhook = $this->route('webhook');

        // on update, the webhook must belong to the form in the url
        abort_if($webhook && ! $webhook->form()->is($this->route('form')), 404);

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
            'webhook_url' => 'required|url:http,https',
            'webhook_method' => 'required|in:GET,POST,PUT,PATCH',
            'provider' => 'nullable|string|in:zapier,make',
            'is_enabled' => 'boolean',
            'headers' => 'array|nullable',
        ];
    }
}
