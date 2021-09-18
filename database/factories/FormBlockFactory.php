<?php

namespace Database\Factories;

use App\Models\Form;
use App\Models\FormBlock;
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
            'type' => FormBlock::MESSAGE,
            'responses' => null,
            'sequence' => 0,
            'webhook_url' => null,
            'form_id' => Form::factory()
        ];
    }

    public function question()
    {
        return $this->state(function () {
            return [
                'type' => FormBlock::CLICK,
            ];
        });
    }
}
