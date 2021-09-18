<?php

namespace Database\Factories;

use App\Models\FormBlock;
use App\Models\Model;
use App\Models\FormBlockInteraction;
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
            'type' => FormBlockInteraction::TYPE_CLICK,
            'form_block_id' => FormBlock::factory(),
        ];
    }
}
