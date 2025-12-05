<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\City;
use App\Models\Area;
use App\Models\University;
use Illuminate\Support\Facades\DB;
class CitiesTableSeeder extends Seeder
{
    public function run()
    {
        // Truncate tables to avoid duplicates (optional)
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        City::truncate();
        Area::truncate();
        University::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $egyptData = [
            [
                'city' => 'Cairo',
                'areas' => ['Zamalek', 'Maadi', 'Nasr City', 'Al Rehab', 'Katameya', 'Dokki', 'Obour', 'Sheraton'],
                'universities' => ['Cairo University', 'American University in Cairo', 'Ain Shams University', 'British University in Egypt']
            ],
            [
                'city' => 'Alexandria',
                'areas' => ['Smouha', 'Agami', 'Mandara', 'Sidi Gaber', 'Gheit El Enab', 'Borg El Arab'],
                'universities' => ['Alexandria University', 'Arab Open University', 'Arab Academy for Science and Technology']
            ],
            [
                'city' => 'Giza',
                'areas' => ['Pyramids', '6th of October', 'Sheikh Zayed', 'Omrania', 'Boulaq Al Dakrour'],
                'universities' => ['Giza University (hypothetical)', 'Modern Academy', 'October 6 University']
            ],
            [
                'city' => 'Suez',
                'areas' => ['Arbaeen District', 'Ataka', 'Ain Sokhna', 'Faisal'],
                'universities' => ['Suez University']
            ],
            [
                'city' => 'Ismailia',
                'areas' => ['District 1', 'District 2', 'Al Qassasin', 'Abu Rbeie'],
                'universities' => ['Suez Canal University']
            ],
            [
                'city' => 'Mansoura',
                'areas' => ['New Mansoura', 'Talkha', 'Sherbin', 'Dekernes'],
                'universities' => ['Mansoura University', 'Modern University for Technology']
            ],
            [
                'city' => 'Tanta',
                'areas' => ['El Omraniya', 'Mosque Square', 'Al Azizya', 'Al Khalidiya'],
                'universities' => ['Tanta University']
            ],
            [
                'city' => 'Zagazig',
                'areas' => ['Al Salheya', 'Kfar Tantosh', 'New Zagazig'],
                'universities' => ['Zagazig University']
            ],
            [
                'city' => 'Assiut',
                'areas' => ['New Assiut', 'Abnoub', 'Dairout', 'Manfalout'],
                'universities' => ['Assiut University', 'Al-Ahleya Private University']
            ],
            [
                'city' => 'Minya',
                'areas' => ['New Minya', 'Mallawi', 'Abu Qurqas', 'Samalout'],
                'universities' => ['Minia University']
            ],
            [
                'city' => 'Qena',
                'areas' => ['New Qena', 'Abu Tesht', 'Nag Hammadi', 'Farshout'],
                'universities' => ['South Valley University - Qena Campus']
            ],
            [
                'city' => 'Luxor',
                'areas' => ['New Luxor', 'Al Tod', 'Esna', 'Al Bayda'],
                'universities' => ['South Valley University - Luxor Branch']
            ],
            [
                'city' => 'Aswan',
                'areas' => ['New Aswan', 'Kalabsha', 'Edfu', 'Kom Ombo'],
                'universities' => ['Aswan University']
            ],
            [
                'city' => 'Faiyum',
                'areas' => ['New Faiyum', 'Itsa', 'Sanours', 'Tamiya'],
                'universities' => ['Fayoum University']
            ],
            [
                'city' => 'Beni Suef',
                'areas' => ['New Beni Suef', 'Al Wasta', 'Naser', 'Al Bahansa'],
                'universities' => ['Beni Suef University']
            ],
            [
                'city' => 'Damietta',
                'areas' => ['New Damietta', 'Faraskur', 'Kafr Saad', 'Ezbet El Borg'],
                'universities' => ['Damietta University']
            ],
            [
                'city' => 'Port Said',
                'areas' => ['Al Mansoura New', 'Al Dawahi', 'Al Arab', 'Al Zahour'],
                'universities' => ['Port Said University']
            ],
            [
                'city' => 'Red Sea',
                'areas' => ['Hurghada', 'Ras Ghareb', 'Safaga', 'Marsa Alam'],
                'universities' => ['South Valley University - Hurghada Branch']
            ],
            [
                'city' => 'New Valley',
                'areas' => ['Kharga', 'Dakhla', 'Farafra', 'Baris'],
                'universities' => ['Assiut University - Kharga Branch']
            ],
            [
                'city' => 'Matrouh',
                'areas' => ['Marsa Matrouh', 'Al Saloum', 'Al Dabaa', 'Al Nijaila'],
                'universities' => ['Matrouh Higher Institute']
            ],
            [
                'city' => 'North Sinai',
                'areas' => ['Al Arish', 'Al Hassana', 'Bir Al Abd', 'Nekhel'],
                'universities' => ['Suez Canal University - Al Arish Branch']
            ],
            [
                'city' => 'South Sinai',
                'areas' => ['Sharm El Sheikh', 'Dahab', 'Abu Redis', 'Taba'],
                'universities' => ['Sharm El Sheikh International Academy']
            ],
            [
                'city' => 'Kafr El Sheikh',
                'areas' => ['New Kafr El Sheikh', 'Desouk', 'Fooh', 'Metobas'],
                'universities' => ['Kafr El Sheikh University']
            ],
            [
                'city' => 'Beheira',
                'areas' => ['Damanhour', 'Rosetta', 'Edku', 'Kafr El Dawwar', 'Al Mahmoudia'],
                'universities' => ['Alexandria University - Damanhour Branch']
            ],
            [
                'city' => 'Gharbia',
                'areas' => ['Tanta', 'Zefta', 'Santaa', 'Basyoun', 'Qotour'],
                'universities' => ['Tanta University (serving Gharbia)']
            ],
            [
                'city' => 'Dakahlia',
                'areas' => ['Mansoura', 'Mit Ghamr', 'Belqas', 'Sherbin'],
                'universities' => ['Mansoura University']
            ],
            [
                'city' => 'Sohag',
                'areas' => ['New Sohag', 'Akhmim', 'Tahta', 'Dar El Salam', 'Girga'],
                'universities' => ['Sohag University']
            ],
        ];

        foreach ($egyptData as $data) {
            $city = City::create(['name' => $data['city']]);

            foreach ($data['areas'] as $areaName) {
                Area::create([
                    'city_id' => $city->id,
                    'name' => $areaName
                ]);
            }

            foreach ($data['universities'] as $uniName) {
                University::create([
                    'city_id' => $city->id,
                    'name' => $uniName
                ]);
            }
        }
    }
}
