<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RentalRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class RentalRequestController extends Controller
{
    /**
     * Get all rental requests for the authenticated owner
     */
    public function index(Request $request)
    {
        $query = RentalRequest::with(['user', 'property'])
            ->whereHas('property', function ($q) {
                $q->where('owner_id', Auth::id());
            });

        // Flexible search: tenant name OR property title
        if ($request->search) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->whereHas('user', function ($q2) use ($searchTerm) {
                    $q2->where('name', 'like', "%{$searchTerm}%");
                })
                    ->orWhereHas('property', function ($q2) use ($searchTerm) {
                        $q2->where('title', 'like', "%{$searchTerm}%");
                    });
            });
        }

        // Filter by status
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Sort newest first
        $query->orderBy('created_at', 'desc');

        // Pagination
        $perPage = 10;
        $requests = $query->paginate($perPage);

        return response()->json([
            'data' => $requests->items(),
            'current_page' => $requests->currentPage(),
            'last_page' => $requests->lastPage(),
            'per_page' => $requests->perPage(),
            'total' => $requests->total(),
        ]);
    }

    /**
     * Approve a rental request
     */
    public function approve($id)
    {
        DB::beginTransaction();
        try {
            $request = RentalRequest::with('property')
                ->whereHas('property', function ($q) {
                    $q->where('owner_id', Auth::id());
                })
                ->findOrFail($id);

            if ($request->status !== 'pending') {
                return response()->json(['message' => 'Request is not pending'], 400);
            }

            // Update request status
            $request->update([
                'status' => 'approved',
                'owner_response' => 'Approved',
                'responded_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Request approved',
                'request' => $request,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Reject a rental request
     */
    public function reject($id)
    {
        $request = RentalRequest::with('property')
            ->whereHas('property', function ($q) {
                $q->where('owner_id', Auth::id());
            })
            ->findOrFail($id);

        if ($request->status !== 'pending') {
            return response()->json(['message' => 'Request is not pending'], 400);
        }

        $request->update([
            'status' => 'rejected',
            'owner_response' => 'Rejected',
            'responded_at' => now(),
        ]);

        return response()->json([
            'message' => 'Request rejected',
            'request' => $request,
        ]);
    }

    /**
     * Show rental request details
     */
    public function show($id)
    {
        $request = RentalRequest::with(['user', 'property'])
            ->whereHas('property', function ($q) {
                $q->where('owner_id', Auth::id());
            })
            ->findOrFail($id);

        return response()->json($request);
    }

    /**
     * Submit a new rental request
     */
    public function store(Request $request)
    {
        // Validation rules
        $validator = Validator::make($request->all(), [
            'property_id' => 'required|exists:properties,id',
            'desired_start_date' => 'required|date|after_or_equal:today',
            'duration_months' => 'required|integer|min:1',
            'message' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Create rental request
        $rentalRequest = RentalRequest::create([
            'property_id' => $request->property_id,
            'user_id' => Auth::id(),
            'desired_start_date' => $request->desired_start_date,
            'duration_months' => $request->duration_months,
            'message' => $request->message,
            'status' => 'pending', // default status
        ]);

        return response()->json([
            'message' => 'Rental request submitted successfully',
            'rental_request' => $rentalRequest
        ], 201);
    }
}
