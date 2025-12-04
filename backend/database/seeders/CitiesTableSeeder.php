<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\City;
use App\Models\Area;

class CitiesTableSeeder extends Seeder
{
    public function run()
    {
        City::factory()->count(5)->create()->each(function ($city) {
            Area::factory()->count(rand(3,6))->create(['city_id' => $city->id]);
        });
    }
}
