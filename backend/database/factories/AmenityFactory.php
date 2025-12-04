<?php

namespace Database\Factories;

use App\Models\Amenity;
use Illuminate\Database\Eloquent\Factories\Factory;

class AmenityFactory extends Factory
{
    protected $model = Amenity::class;

    public function definition()
    {
        $items = ['WiFi','Air Conditioning','Heating','Parking','Gym','Pool','Laundry','Furnished','TV','Kitchen'];

        return [
            'name' => $this->faker->unique()->randomElement($items),
        ];
    }
}
