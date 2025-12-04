<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Resources\CityResource;
use App\Http\Resources\AreaResource;
use App\Http\Resources\UniversityResource;
use App\Models\City;
use App\Models\Area;
use App\Models\University;

class LocationController extends Controller
{
    // Get cities
    public function getCities(Request $request)
    {
        $cities = City::latest()->paginate(10);
        return CityResource::collection($cities);
    }

    // Get areas
    public function getAreas(Request $request)
    {
        $query = Area::with('city');
        if ($request->has('city_id')) {
            $query->where('city_id', $request->city_id);
        }
        $areas = $query->latest()->paginate(10);
        return AreaResource::collection($areas);
    }

    // Get universities
    public function getUniversities(Request $request)
    {
        $query = University::with('city');
        if ($request->has('city_id')) {
            $query->where('city_id', $request->city_id);
        }
        $universities = $query->latest()->paginate(10);
        return UniversityResource::collection($universities);
    }
}
