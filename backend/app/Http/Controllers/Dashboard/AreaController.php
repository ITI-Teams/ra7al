<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Area;
use App\Models\City;
use Illuminate\Http\Request;
use App\Http\Requests\AreaStoreRequest;
use App\Http\Requests\AreaUpdateRequest;

class AreaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $areas = Area::with('city')->latest()->paginate(10);
        return view('dashboard.areas.index', compact('areas'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $cities = City::all();
        return view('dashboard.areas.create', compact('cities'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(AreaStoreRequest $request)
    {
        Area::create($request->validated());

        return redirect()->route('areas.index')
            ->with('toast', ['type' => 'success', 'message' => 'Area created successfully']);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Area $area)
    {
        $cities = City::all();
        return view('dashboard.areas.edit', compact('cities', 'area'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(AreaUpdateRequest $request, Area $area)
    {
        $area->update($request->validated());

        return redirect()->route('areas.index')
            ->with('toast', ['type' => 'success', 'message' => 'Area updated successfully']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Area $area)
    {
        $area->delete();

        return redirect()->route('areas.index')
            ->with('toast', ['type' => 'warning', 'message' => 'Area deleted successfully']);
    }

    public function trashed()
    {
        $areas = Area::onlyTrashed()->with('city')->latest()->paginate(10);
        return view('dashboard.areas.trashed', compact('areas'));
    }

    public function restore($id)
    {
        $area = Area::onlyTrashed()->findOrFail($id);
        $area->restore();

        return redirect()->route('areas.index')
            ->with('toast', ['type' => 'success', 'message' => 'Area restored successfully']);
    }

    public function forceDelete($id)
    {
        $area = Area::onlyTrashed()->findOrFail($id);
        $area->forceDelete();

        return redirect()->route('areas.index')
            ->with('toast', ['type' => 'error', 'message' => 'Area permanently deleted successfully']);
    }
}
