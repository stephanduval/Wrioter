<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition(): array
    {
        return [
            'client_id' => User::factory(),
            'title' => $this->faker->sentence(3),
            'property' => $this->faker->optional()->address,
            'contact_email' => $this->faker->optional()->email,
            'status' => $this->faker->randomElement(['received', 'in_progress', 'delivered']),
            'time_preference' => $this->faker->randomElement(['before_noon', 'before_4pm', 'anytime']),
            'deadline' => $this->faker->optional()->dateTimeBetween('now', '+1 year'),
            'service_type' => $this->faker->randomElement(['translation', 'revision', 'modifications', 'transcription', 'voice_over', 'other']),
            'service_description' => $this->faker->optional()->paragraph,
            'date_requested' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }
} 
