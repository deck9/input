<?php

namespace Database\Factories;

use App\Models\Form;
use App\Models\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\Factory;

class FormSessionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = FormSession::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'token' => Str::random(32),
            'form_id' => Form::factory(),
        ];
    }
}
