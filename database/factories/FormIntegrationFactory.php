<?php

namespace Database\Factories;

use App\Models\FormIntegration;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\FormIntegration>
 */
class FormIntegrationFactory extends Factory
{


    protected $model = FormIntegration::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'name' => $this->faker->name,
            'webhook_url' => $this->faker->url,
            'webhook_method' => 'GET',
            'headers' => [],
            'form_id' => \App\Models\Form::factory(),
        ];
    }
}
