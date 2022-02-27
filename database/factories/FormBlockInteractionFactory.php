<?php

namespace Database\Factories;

use App\Models\FormBlock;
use App\Models\FormBlockInteraction;
use App\Enums\FormBlockInteractionType;
use Illuminate\Database\Eloquent\Factories\Factory;

class FormBlockInteractionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = FormBlockInteraction::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'uuid' => $this->faker->uuid(),
            'type' => FormBlockInteractionType::button,
            'form_block_id' => FormBlock::factory(),
        ];
    }
}
