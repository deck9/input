<?php

namespace Database\Factories;

use App\Models\Form;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

class FormFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Form::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'uuid' => $this->faker->uuid,
            'name' => $this->faker->name,
            'description' => $this->faker->sentence,
            'is_notification_via_mail' => false,
            'brand_color' => '#333333',
            'published_at' => Carbon::now()->subDays(7),
            'user_id' => User::factory(),
        ];
    }

    public function unpublished()
    {
        return $this->state(function ($attributes) {
            return [
                'published_at' => null
            ];
        });
    }
}
