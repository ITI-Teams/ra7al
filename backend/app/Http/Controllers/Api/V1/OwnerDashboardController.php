<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Property;
use App\Models\RentalRequest;
use App\Models\PropertyRental;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class OwnerDashboardController extends Controller
{
    public function index()
    {
        $ownerId = Auth::id();
        $propertiesCount = Property::where('owner_id', $ownerId)->count();

        $propertiesByStatus = Property::where('owner_id', $ownerId)
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();

        $propertiesByCity = Property::where('owner_id', $ownerId)
            ->select('city_id', DB::raw('COUNT(*) as count'))
            ->with('city:id,name')
            ->groupBy('city_id')
            ->get()
            ->map(function ($item) {
                return [
                    'city' => $item->city->name ?? 'Unknown',
                    'count' => $item->count
                ];
            });

        $activeTenants = PropertyRental::where('owner_id', $ownerId)
            ->where('status', 'active')
            ->count();

        $requestsStats = RentalRequest::whereHas('property', function ($q) use ($ownerId) {
            $q->where('owner_id', $ownerId);
        })
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();

        $requestsPerProperty = RentalRequest::whereHas('property', function ($q) use ($ownerId) {
            $q->where('owner_id', $ownerId);
        })
            ->select('property_id', DB::raw('COUNT(*) as total_requests'))
            ->groupBy('property_id')
            ->with(['property:id,title'])
            ->get()
            ->map(function ($item) {
                return [
                    'property_id' => $item->property_id,
                    'property_title' => $item->property->title ?? 'Unknown',
                    'requests' => $item->total_requests
                ];
            });

        return response()->json([
            'status' => true,
            'data' => [
                'properties_count' => $propertiesCount,
                'properties_by_status' => $propertiesByStatus,
                'properties_by_city' => $propertiesByCity,
                'active_tenants' => $activeTenants,
                'requests_stats' => $requestsStats,
                'requests_per_property' => $requestsPerProperty
            ]
        ]);
    }
}
