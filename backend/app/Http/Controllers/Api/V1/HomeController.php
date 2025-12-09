<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\City;

class HomeController extends Controller
{
    public function latestPropertiesByCity()
    {
        $cities = City::inRandomOrder()
            ->limit(4)
            ->with(['properties' => function ($q) {
                $q->latest()->take(4);
            }])
            ->get();

        return response()->json([
            'cities' => $cities
        ]);
    }
}
