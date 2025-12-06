<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\http\Requests\PropertySearchRequest;
use App\Models\Property;
use App\Http\Resources\PropertyResource;

class PropertySearchController extends Controller
{

    public function search(PropertySearchRequest $request)
    {
        $keyword = $request->keyword;

        $properties = Property::query()
            ->where('admin_approval_status', 'approved')
            ->where(function ($q) use ($keyword) {
                $q->where('title', 'LIKE', "%{$keyword}%")
                    ->orWhere('description', 'LIKE', "%{$keyword}%")
                    ->orWhereHas('city', fn($city) => $city->where('name', 'LIKE', "%{$keyword}%"))
                    ->orWhereHas('area', fn($area) => $area->where('name', 'LIKE', "%{$keyword}%"));
                //->orWhereHas('university', fn($uni) => $uni->where('name', 'LIKE', "%{$keyword}%"));
            })
            ->paginate(10);

        return PropertyResource::collection($properties);
        // return response()->json($properties);
    }
}
