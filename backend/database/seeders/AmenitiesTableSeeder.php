<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Amenity;

class AmenitiesTableSeeder extends Seeder
{
    public function run()
    {
        $amenities = ['WiFi','Air Conditioning','Heating','Parking','Gym','Pool','Laundry','Furnished','TV','Kitchen'];

        foreach ($amenities as $name) {
            Amenity::firstOrCreate(['name' => $name]);
        }
    }
}
