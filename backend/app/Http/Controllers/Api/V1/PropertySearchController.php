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
        $filters = $request->validated();

        $query = Property::query()
            ->with(['city', 'area', 'primaryImage']);

        if (!empty($filters['keyword'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('title', 'LIKE', "%{$filters['keyword']}%")
                    ->orWhere('description', 'LIKE', "%{$filters['keyword']}%");
            });
        }

        if (!empty($filters['city_id'])) {
            $query->where('city_id', $filters['city_id']);
        }

        if (!empty($filters['area_id'])) {
            $query->where('area_id', $filters['area_id']);
        }

        if (!empty($filters['gender_requirement'])) {
            $query->where('gender_requirement', $filters['gender_requirement']);
        }

        if (!empty($filters['price_min'])) {
            $query->where('price', '>=', $filters['price_min']);
        }

        if (!empty($filters['price_max'])) {
            $query->where('price', '<=', $filters['price_max']);
        }

        if (!empty($filters['accommodation_type'])) {
            $query->where('accommodation_type', $filters['accommodation_type']);
        }

        if (!empty($filters['university'])) {
            $query->where('university', $filters['university']);
        }

        if (!empty($filters['beds'])) {
            $query->where('beds', $filters['beds']);
        }

        if (!empty($filters['bathrooms_count'])) {
            $query->where('bathrooms_count', $filters['bathrooms_count']);
        }

        if (!empty($filters['is_featured'])) {
            $query->where('is_featured', true);
        }

        return PropertyResource::collection(
            $query->paginate(10)
        );
    }
}
