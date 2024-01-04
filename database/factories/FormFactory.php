<?php

namespace Database\Factories;

use App\Models\Form;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

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
        $user = User::factory()->withTeam()->create();

        return [
            'uuid' => $this->faker->uuid,
            'name' => $this->faker->name,
            'description' => $this->faker->sentence,
            'is_notification_via_mail' => false,
            'brand_color' => '#333333',
            'published_at' => Carbon::now()->subDays(7),
            'user_id' => $user->id,
            'team_id' => $user->current_team_id,
        ];
    }

    public function unpublished()
    {
        return $this->state(function ($attributes) {
            return [
                'published_at' => null,
            ];
        });
    }

    public function deleted()
    {
        return $this->state(function ($attributes) {
            return [
                'deleted_at' => Carbon::now(),
            ];
        });
    }
}
