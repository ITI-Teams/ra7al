<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Amenity;

class AmenityController extends Controller
{
    public function index()
    {
        return response()->json(['data' => Amenity::select('id','name')->get()]);
    }
}
