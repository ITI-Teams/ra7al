<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\University;
use App\Models\City;
use Illuminate\Http\Request;
use App\Http\Requests\UniversityStoreRequest;
use App\Http\Requests\UniversityUpdateRequest;

class UniversityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $universities = University::with('city')->latest()->paginate(10);
        return view('dashboard.universities.index', compact('universities'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $cities = City::all();
        return view('dashboard.universities.create', compact('cities'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UniversityStoreRequest $request)
    {
        University::create($request->validated());

        return redirect()->route('universities.index')
            ->with('toast', ['type' => 'success', 'message' => 'University created successfully']);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(University $university)
    {
        $cities = City::all();
        return view('dashboard.universities.edit', compact('cities', 'university'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UniversityUpdateRequest $request, University $university)
    {
        $university->update($request->validated());

        return redirect()->route('universities.index')
            ->with('toast', ['type' => 'success', 'message' => 'University updated successfully']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(University $university)
    {
        $university->delete();

        return redirect()->route('universities.index')
            ->with('toast', ['type' => 'warning', 'message' => 'University deleted successfully']);
    }

    public function trashed()
    {
        $universities = University::onlyTrashed()->with('city')->latest()->paginate(10);
        return view('dashboard.universities.trashed', compact('universities'));
    }

    public function restore($id)
    {
        $university = University::onlyTrashed()->findOrFail($id);
        $university->restore();

        return redirect()->route('universities.index')
            ->with('toast', ['type' => 'success', 'message' => 'University restored successfully']);
    }

    public function forceDelete($id)
    {
        $university = University::onlyTrashed()->findOrFail($id);
        $university->forceDelete();

        return redirect()->route('universities.index')
            ->with('toast', ['type' => 'error', 'message' => 'University permanently deleted successfully']);
    }
}
