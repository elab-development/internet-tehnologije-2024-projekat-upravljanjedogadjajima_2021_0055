<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use App\Models\Category;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name'        => fake()->sentence(3),
            'description' => fake()->optional()->paragraph(),
            'starts_at'   => fake()->dateTimeBetween('+0 days', '+1 month'),
            'user_id'     => User::inRandomOrder()->value('id') ?? User::factory(),
            'category_id' => Category::inRandomOrder()->value('id') ?? Category::factory(),
        ];
    }
}
