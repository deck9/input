<?php

namespace Database\Factories;

use App\Models\FormBlock;
use App\Models\Model;
use App\Models\FormSessionResponse;
use App\Models\FormSession;
use App\Models\FormBlockInteraction;
use Illuminate\Database\Eloquent\Factories\Factory;

class ResponseFactory extends Factory
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
            'block_id' => FormBlock::factory(),
            'interaction_id' => FormBlockInteraction::factory(),
            'form_session_id' => FormSession::factory(),
        ];
    }
}
