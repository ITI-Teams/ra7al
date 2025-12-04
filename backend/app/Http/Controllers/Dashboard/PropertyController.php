<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Property;

class PropertyController extends Controller
{
    public function index()
    {
        $properties = Property::latest()->paginate(10);
        return view('dashboard.properties.index', compact('properties'));
    }

    public function approve($id)
    {
        $property = Property::findOrFail($id);
        $property->admin_approval_status = 'approved';
        $property->approved_at = now();
        $property->approved_by = auth()->id();
        $property->save();

        return back()->with('toast', ['type' => 'success', 'message' => 'Property approved successfully.']);
    }

    public function reject($id)
    {
        $property = Property::findOrFail($id);

        $property->admin_approval_status = 'rejected';
        $property->approved_at = null;
        $property->approved_by = null;
        $property->save();

        return back()->with('toast', ['type' => 'success', 'message' => 'Property rejected.']);
    }

    public function destroy($id)
    {
        $property = Property::findOrFail($id);
        $property->delete();

        return back()->with('toast', ['type' => 'success', 'message' => 'Property deleted.']);
    }

}
