<?php

namespace Database\Factories;

use App\Models\FormBlock;
use App\Models\FormBlockInteraction;
use App\Models\FormSession;
use App\Models\FormSessionResponse;
use App\Models\Model;
use Illuminate\Database\Eloquent\Factories\Factory;

class FormSessionResponseFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = FormSessionResponse::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'value' => $this->faker->word(),
            'form_block_id' => FormBlock::factory(),
            'form_block_interaction_id' => FormBlockInteraction::factory(),
            'form_session_id' => FormSession::factory(),
        ];
    }
}
