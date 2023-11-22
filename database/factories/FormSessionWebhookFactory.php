<?php

namespace Database\Factories;

use App\Models\FormSession;
use App\Models\FormWebhook;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\FormSessionWebhook>
 */
class FormSessionWebhookFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'status' => 200,
            'response' => '{message: "ok"}',
            'tries' => 0,
            'form_session_id' => FormSession::factory()->create(),
            'form_webhook_id' => FormWebhook::factory()->create(),
        ];
    }
}
