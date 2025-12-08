<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Property;
use App\Models\Message;
use App\Models\City;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Return top summary numbers for the cards.
     */
    public function stats()
    {
        $totalUsers = User::count();
        $totalProperties = Property::count();
        $totalMessages = Message::count();
        $totalCities = City::count();

        return response()->json([
            'totalUsers' => $totalUsers,
            'totalProperties' => $totalProperties,
            'totalMessages' => $totalMessages,
            'totalCities' => $totalCities,
        ]);
    }

    /**
     * Helper: return last N months labels (YYYY-MM) and a map from month => 0
     */
    protected function lastMonths(int $months = 12)
    {
        $labels = [];
        $map = [];
        $now = Carbon::now()->startOfMonth();
        for ($i = $months - 1; $i >= 0; $i--) {
            $m = $now->copy()->subMonths($i);
            $key = $m->format('Y-m'); // e.g. 2025-12
            $labels[] = $m->format('M Y'); // e.g. Dec 2025 (friendly label)
            $map[$key] = 0;
        }
        return [$labels, $map];
    }

    /**
     * Users per month (last 12 months).
     */
    public function usersPerMonth()
    {
        [$labels, $map] = $this->lastMonths(12);

        $rows = User::select(DB::raw("DATE_FORMAT(created_at, '%Y-%m') as ym"), DB::raw("COUNT(*) as count"))
            ->where('created_at', '>=', Carbon::now()->subMonths(12)->startOfMonth())
            ->groupBy('ym')
            ->orderBy('ym')
            ->get();

        foreach ($rows as $r) {
            if (array_key_exists($r->ym, $map)) {
                $map[$r->ym] = (int) $r->count;
            }
        }

        return response()->json([
            'labels' => $labels,
            'data' => array_values($map),
        ]);
    }

    /**
     * Users by role.
     */
    public function usersByRole()
    {
        $rows = User::select('role', DB::raw('COUNT(*) as count'))
            ->groupBy('role')
            ->get();

        $labels = $rows->pluck('role');
        $data = $rows->pluck('count')->map(fn($v) => (int)$v);

        return response()->json([
            'labels' => $labels,
            'data' => $data,
        ]);
    }

    /**
     * Properties per city (top N cities).
     */
    public function propertiesPerCity(Request $request)
    {
        $limit = (int) $request->get('limit', 8);

        $rows = Property::select('cities.name as city_name', DB::raw('COUNT(properties.id) as count'))
            ->join('cities', 'properties.city_id', '=', 'cities.id')
            ->groupBy('cities.id', 'cities.name')
            ->orderByDesc('count')
            ->limit($limit)
            ->get();

        $labels = $rows->pluck('city_name');
        $data = $rows->pluck('count')->map(fn($v) => (int)$v);

        return response()->json([
            'labels' => $labels,
            'data' => $data,
        ]);
    }

    /**
     * Properties by status (available, partially_occupied, etc.)
     */
    public function propertiesByStatus()
    {
        $rows = Property::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();

        $labels = $rows->pluck('status');
        $data = $rows->pluck('count')->map(fn($v) => (int)$v);

        return response()->json([
            'labels' => $labels,
            'data' => $data,
        ]);
    }

    /**
     * Messages by priority (low, normal, high, urgent).
     */
    public function messagesByPriority()
    {
        $rows = Message::select('priority', DB::raw('COUNT(*) as count'))
            ->groupBy('priority')
            ->get();

        // Ensure order low -> normal -> high -> urgent (if you want)
        $order = ['low', 'normal', 'high', 'urgent'];
        $counts = [];
        foreach ($order as $p) {
            $found = $rows->firstWhere('priority', $p);
            $counts[] = $found ? (int)$found->count : 0;
        }

        return response()->json([
            'labels' => $order,
            'data' => $counts,
        ]);
    }
}
