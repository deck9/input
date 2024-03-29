<?php

namespace Database\Factories;

use App\Enums\FormBlockType;
use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormBlockInteraction;
use Illuminate\Database\Eloquent\Factories\Factory;

class FormBlockFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = FormBlock::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'uuid' => $this->faker->uuid,
            'message' => $this->faker->sentence(10),
            'type' => FormBlockType::none,
            'sequence' => 0,
            'webhook_url' => null,
            'form_id' => Form::factory(),
        ];
    }

    public function input($type, $attributes = [])
    {
        return $this->has(FormBlockInteraction::factory()->input($type, $attributes));
    }
}
