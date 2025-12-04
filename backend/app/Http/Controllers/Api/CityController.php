<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\Request;

class CityController extends Controller
{
    public function index()
    {
        return response()->json(['data' => City::select('id','name')->get()]);
    }

    public function areas(City $city)
    {
        return response()->json(['data' => $city->areas()->select('id','name')->get()]);
    }
}
