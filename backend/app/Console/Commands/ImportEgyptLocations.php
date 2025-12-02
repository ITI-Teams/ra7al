<?php

namespace App\Console\Commands;

use App\Models\Area;
use App\Models\City;
use Illuminate\Console\Command;

class ImportEgyptLocations extends Command
{
    protected $signature = 'import:egypt-locations';
    protected $description = 'Import cities and areas in Egypt from JSON file';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $json = storage_path('app/egypt.json');

        if (!file_exists($json)) {
            $this->error('egypt.json file not found');
            return;
        }

        $data = json_decode(file_get_contents($json), true);

        foreach ($data as $cityName => $areasList) {
            $city = City::firstOrCreate(['name' => $cityName]);

            foreach ($areasList as $areaName => $regions) {
                Area::firstOrCreate([
                    'city_id' => $city->id,
                    'name' => $areaName
                ]);
            }
        }

        $this->info("Imported cities & areas successfully!");
    }
}
