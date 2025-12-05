<?php

namespace Database\Factories;

use App\Models\Property;
use App\Models\User;
use App\Models\City;
use App\Models\Area;
use App\Models\University;
use Illuminate\Database\Eloquent\Factories\Factory;


class PropertyFactory extends Factory
{
    protected $model = Property::class;

    protected $owners = null;
    protected $cities = null;
    protected $areas = null;
    protected $universities = null;

    public function forOwners($owners)
    {
        $this->owners = $owners;
        return $this;
    }

    public function forCities($cities)
    {
        $this->cities = $cities;
        return $this;
    }

    public function forAreas($areas)
    {
        $this->areas = $areas;
        return $this;
    }

    public function forUniversities($universities)
    {
        $this->universities = $universities;
        return $this;
    }

    public function definition()
    {
        $owner_id = $this->owners ? $this->owners->random()->id : User::role('owner')->inRandomOrder()->first()->id;
        $city_id = $this->cities ? $this->cities->random()->id : City::inRandomOrder()->first()->id;
        $area_id = $this->areas ? $this->areas->random()->id : Area::inRandomOrder()->first()->id;
        $university_id = $this->universities ? $this->universities->random()->id : University::inRandomOrder()->first()->id;

        return [
            'owner_id' => $owner_id,
            'city_id' => $city_id,
            'area_id' => $area_id,
            'university_id' => $university_id,
            'title' => $this->faker->sentence,
            'description' => $this->faker->paragraph,
            'price' => $this->faker->numberBetween(2000, 20000),
            'address' => $this->faker->address,
            'gender_requirement' => $this->faker->randomElement(['male', 'female']),
            'smoking_allowed' => $this->faker->boolean,
            'pets_allowed' => $this->faker->boolean,
            'furnished' => $this->faker->boolean,
            'total_rooms' => $this->faker->numberBetween(1,5),
            'available_rooms' => $this->faker->numberBetween(1,3),
            'bathrooms_count' => $this->faker->numberBetween(1,3),
            'beds' => $this->faker->numberBetween(1,4),
            'available_spots' => $this->faker->numberBetween(1,4),
            'size' => $this->faker->numberBetween(50, 200),
            'accommodation_type' => $this->faker->randomElement(['apartment','villa','studio']),
            'available_from' => $this->faker->date(),
            'available_to' => $this->faker->date(),
            'payment_methods' => $this->faker->randomElement(['cash','installments']),
            'status' => 'available',
            'admin_approval_status' => 'approved',
            'approved_at' => now(),
            'approved_by' => 1,
        ];
    }
}
