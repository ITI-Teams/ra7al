<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\City;
use App\Models\Property;
use App\Models\User;

class PropertiesSeeder extends Seeder
{
    public function run()
    {
        $owners = User::role('owner')->get();
        if ($owners->count() === 0) {
            $owners = User::factory()->count(5)->create()->each(function($user) {
                $user->assignRole('owner');
            });
        }

        $cities = City::all();

        foreach ($cities as $city) {
            $areas = $city->areas;
            $universities = $city->universities;

            Property::factory()
                ->count(10)
                ->forOwners($owners)
                ->forCities(collect([$city]))
                ->forAreas($areas)
                ->forUniversities($universities)
                ->create();
        }
    }

}
