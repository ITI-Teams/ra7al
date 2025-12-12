<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\PropertyRental;
use App\Models\RentalRequest;
use App\Models\PropertyImage;
use App\Models\Amenity;
use App\Models\City;
use App\Models\Area;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use App\Services\NotificationService;
use App\Notifications\PropertyCreatedNotification;
use App\Notifications\PropertyUpdatedNotification;
use App\Models\User;

class PropertyController extends Controller
{

    public function getSimilarProperties(int $id)
    {
        try {
            $currentProperty = Property::findOrFail($id);

            // Get area_id (location_id in properties table)
            $areaId = $currentProperty->location_id;

            // First: Try to get properties from same area
            $similarProperties = Property::with(['area', 'images', 'amenities', 'owner', 'rentals.tenant'])
                ->where('id', '!=', $id)
                ->where('area_id', $areaId)
                ->where('status', 'available')
                ->limit(4)
                ->get();

            // If less than 4, get more from same city
            if ($similarProperties->count() < 4) {
                $needed = 4 - $similarProperties->count();
                $existingIds = $similarProperties->pluck('id')->push($id)->toArray();

                $cityId = $currentProperty->area->city_id;

                $additionalProperties = Property::with(['area.city', 'images', 'amenities', 'owner', 'rentals.tenant'])
                    ->whereNotIn('id', $existingIds)
                    ->whereHas('area', function ($q) use ($cityId) {
                        $q->where('city_id', $cityId);
                    })
                    ->where('status', 'available')
                    ->limit($needed)
                    ->get();

                $similarProperties = $similarProperties->merge($additionalProperties);
            }

            return response()->json([
                'success' => true,
                'data' => $similarProperties,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching similar properties: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch similar properties' . $e->getMessage(),
            ], 500);
        }
    }


    public function index(Request $request)
    {
        $query = Property::query()
            ->select('properties.*')
            ->with([
                'owner:id,name,phone,avatar',
                'city' => function ($query) {
                    $query->select('id', 'name');
                },
                'area' => function ($query) {
                    $query->select('id', 'name');
                },
                'images' => function ($q) {
                    $q->orderBy('priority');
                },
                'amenities',
                'activeRentals' => function ($query) {
                    $query->select('property_rentals.*')
                        ->with(['tenant:id,name,avatar']);
                },
            ]);

        $query->withCount([
            'activeRentals as active_rentals_count'
        ]);

        $query->where('admin_approval_status', 'approved');

        if ($request->has('city_id')) {
            $query->where('properties.city_id', $request->city_id);
        }

        if ($request->has('area_id')) {
            $query->where('properties.area_id', $request->area_id);
        }

        if ($request->has('min_price')) {
            $query->where('properties.price', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $query->where('properties.price', '<=', $request->max_price);
        }

        if ($request->has('accommodation_type')) {
            $query->where('properties.accommodation_type', $request->accommodation_type);
        }

        if ($request->has('total_rooms')) {
            $query->where('properties.total_rooms', '>=', $request->total_rooms);
        }

        if ($request->has('gender_requirement')) {
            $query->where('properties.gender_requirement', $request->gender_requirement);
        }

        if ($request->has('smoking_allowed')) {
            $query->where('properties.smoking_allowed', $request->boolean('smoking_allowed'));
        }

        if ($request->has('pets_allowed')) {
            $query->where('properties.pets_allowed', $request->boolean('pets_allowed'));
        }

        if ($request->has('available_spots')) {
            $query->where('properties.available_spots', '>=', $request->available_spots);
        }

        if ($request->has('available_from')) {
            $query->where('properties.available_from', '<=', $request->available_from);
        }

        if (!Auth::check() || !$request->has('show_all')) {
            $query->where('properties.status', 'available');
        }

        if ($request->has('university_id')) {
            $query->where('properties.university_id',  $request->university_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('properties.title', 'like', '%' . $search . '%')
                    ->orWhere('properties.description', 'like', '%' . $search . '%')
                    ->orWhere('properties.address', 'like', '%' . $search . '%');
            });
        }

        if (Auth::check() && $request->user()->is_owner) {
            $query->withCount([
                'rentalRequests as pending_requests_count' => function ($query) {
                    $query->where('status', 'pending');
                }
            ]);
        }

        $sort = $request->get('sort', 'newest');
        switch ($sort) {
            case 'price_low':
                $query->orderBy('properties.price');
                break;
            case 'price_high':
                $query->orderByDesc('properties.price');
                break;
            case 'available_spots':
                $query->orderByDesc('properties.available_spots');
                break;
            case 'oldest':
                $query->orderBy('properties.created_at');
                break;
            default:
                $query->orderByDesc('properties.created_at');
        }

        $perPage = $request->get('per_page', 12);
        $properties = $query->paginate($perPage);

        $properties->getCollection()->transform(function ($property) {
            return $this->formatProperty($property);
        });

        return response()->json([
            'success' => true,
            'data' => $properties,
            'filters' => $this->getFilters()
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        if (!$user->role == "owner") {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to add properties'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'address' => 'required|string|max:500',

            'city_id' => 'required|exists:cities,id',
            'area_id' => 'required|exists:areas,id',

            'gender_requirement' => 'required|in:male,female',
            'smoking_allowed' => 'boolean',
            'pets_allowed' => 'boolean',
            'furnished' => 'boolean',

            'total_rooms' => 'required|integer|min:1',
            'available_rooms' => 'required|integer|min:1|lte:total_rooms',
            'bathrooms_count' => 'required|integer|min:1',
            'beds' => 'required|integer|min:1',
            'available_spots' => 'required|integer|min:1',
            'size' => 'nullable|integer|min:0',

            'accommodation_type' => 'nullable|string|max:100',
            'university_id' => 'required|exists:universities,id',

            'available_from' => 'required|date',
            'available_to' => 'nullable|date|after:available_from',

            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120',

            'amenities' => 'nullable|array',
            'amenities.*' => 'exists:amenities,id',
            'payment_methods' => 'nullable|array',
            'payment_methods.*' => 'string|in:cash,bank_transfer,vodafone_cash',
            'owner_id' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            $property = Property::create([
                'owner_id' => $user->id,
                'city_id' => $request->city_id,
                'area_id' => $request->area_id,
                'title' => $request->title,
                'description' => $request->description,
                'price' => $request->price,
                'address' => $request->address,
                'gender_requirement' => $request->gender_requirement,
                'smoking_allowed' => $request->boolean('smoking_allowed'),
                'pets_allowed' => $request->boolean('pets_allowed'),
                'furnished' => $request->boolean('furnished'),
                'total_rooms' => $request->total_rooms,
                'available_rooms' => $request->available_rooms,
                'bathrooms_count' => $request->bathrooms_count,
                'beds' => $request->beds,
                'available_spots' => $request->available_spots,
                'size' => $request->size,
                'accommodation_type' => $request->accommodation_type,
                'university_id' => $request->university_id,
                'available_from' => $request->available_from,
                'available_to' => $request->available_to,
                'payment_methods' => $request->has('payment_methods') ? $request->payment_methods : [],
                'status' => 'available'
            ]);

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $image) {
                    $path = $image->store('properties/' . $property->id, 'public');

                    PropertyImage::create([
                        'property_id' => $property->id,
                        'path' => $path,
                        'priority' => $index
                    ]);
                }
            }

            if ($request->has('amenities')) {
                $property->amenities()->sync($request->amenities);
            }
            // Get all admins
            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                $admin->notify(new PropertyCreatedNotification($property));
            }


            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $this->formatProperty($property->load(['images', 'amenities', 'city', 'area'])),
                'message' => 'Property created successfully'
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create property: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $property = Property::with([
            'owner:id,name,phone,avatar,email',
            'city:id,name',
            'area:id,name',
            'images' => function ($q) {
                $q->orderBy('priority');
            },
            'amenities',
            'activeRentals.tenant:id,name,avatar',
            'rentalRequests' => function ($q) {
                $q->where('status', 'pending')
                    ->with('user:id,name,avatar');
            },
            'comments.user',
            'rentals' => function ($query) {
                $query->where('status', 'active')
                    ->with('tenant');
            }
        ])->find($id);

        if (!$property) {
            return response()->json([
                'success' => false,
                'message' => 'Property not found'
            ], 404);
        }

        if ($property->admin_approval_status !== 'approved') {
            $user = Auth::user();

            if (!$user || ($property->owner_id !== $user->id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'This property is not available'
                ], 403);
            }
        }

        $showFullDetails = false;
        $user = Auth::user();

        if ($user) {
            if ($property->owner_id === $user->id) {
                $showFullDetails = true;
            } elseif ($property->activeRentals->contains('tenant_id', $user->id)) {
                $showFullDetails = true;
            }
        }

        $formattedProperty = $this->formatProperty($property, $showFullDetails);

        $response = [
            'success' => true,
            'data' => $formattedProperty,
            'permissions' => [
                'can_edit' => $user && $property->owner_id === $user->id,
                'can_rent' => $user && $property->status === 'available' &&
                    $property->available_spots > 0,
                'can_view_tenants' => $showFullDetails,
                'can_view_requests' => $user && $property->owner_id === $user->id
            ]
        ];

        return response()->json($response);
    }

    public function update(Request $request, $id)
    {
        $property = Property::find($id);

        if (!$property) {
            return response()->json([
                'success' => false,
                'message' => 'Property not found'
            ], 404);
        }

        $user = Auth::user();

        if ($property->owner_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to update this property'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'address' => 'sometimes|string|max:500',

            'city_id' => 'sometimes|exists:cities,id',
            'area_id' => 'sometimes|exists:areas,id',

            'gender_requirement' => 'sometimes|in:male,female',
            'smoking_allowed' => 'sometimes|boolean',
            'pets_allowed' => 'sometimes|boolean',
            'furnished' => 'sometimes|boolean',

            'total_rooms' => 'sometimes|integer|min:1',
            'available_rooms' => 'sometimes|integer|min:0|lte:total_rooms',
            'bathrooms_count' => 'sometimes|integer|min:1',
            'beds' => 'sometimes|integer|min:1',
            'available_spots' => 'sometimes|integer|min:0',
            'size' => 'nullable|integer|min:0',

            'accommodation_type' => 'nullable|string|max:100',
            'university_id' => 'required|exists:universities,id',

            'available_from' => 'sometimes|date',
            'available_to' => 'nullable|date|after:available_from',
            'status' => 'sometimes|in:available,partially_occupied,fully_occupied,maintenance,inactive',

            'images_to_delete' => 'nullable|array',
            'images_to_delete.*' => 'exists:property_images,id',
            'new_images' => 'nullable|array',
            'new_images.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120',

            'amenities' => 'nullable|array',
            'amenities.*' => 'exists:amenities,id',
            'payment_methods' => 'nullable|array',
            'payment_methods.*' => 'string|in:cash,bank_transfer,vodafone_cash',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            $property->update($request->only([
                'title',
                'description',
                'price',
                'address',
                'city_id',
                'area_id',
                'gender_requirement',
                'smoking_allowed',
                'pets_allowed',
                'furnished',
                'total_rooms',
                'available_rooms',
                'bathrooms_count',
                'beds',
                'available_spots',
                'size',
                'accommodation_type',
                'university_id',
                'available_from',
                'available_to',
                'status',
                'payment_methods'
            ]));

            if ($request->has('images_to_delete')) {
                PropertyImage::where('property_id', $property->id)
                    ->whereIn('id', $request->images_to_delete)
                    ->delete();
            }

            if ($request->hasFile('new_images')) {
                $maxPriority = PropertyImage::where('property_id', $property->id)->max('priority') ?? 0;

                foreach ($request->file('new_images') as $index => $image) {
                    $path = $image->store('properties/' . $property->id, 'public');

                    PropertyImage::create([
                        'property_id' => $property->id,
                        'path' => $path,
                        'priority' => $maxPriority + $index + 1
                    ]);
                }
            }

            if ($request->has('amenities')) {
                $property->amenities()->sync($request->amenities);
            }
            // Get all admins
            $admins = User::where('role', 'admin')->get();

            // Send notification to all of them
            NotificationService::sendToMany($admins, new PropertyUpdatedNotification($property));


            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $this->formatProperty($property->load(['images', 'amenities', 'city', 'area'])),
                'message' => 'Property updated successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update property: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $property = Property::find($id);

        if (!$property) {
            return response()->json([
                'success' => false,
                'message' => 'Property not found'
            ], 404);
        }

        $user = Auth::user();

        if ($property->owner_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to delete this property'
            ], 403);
        }

        $activeRentals = $property->activeRentals()->count();
        if ($activeRentals > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete property with active tenants'
            ], 400);
        }

        $property->delete();

        return response()->json([
            'success' => true,
            'message' => 'Property deleted successfully'
        ]);
    }

    public function submitRentalRequest(Request $request, $propertyId)
    {
        $property = Property::find($propertyId);

        if (!$property) {
            return response()->json([
                'success' => false,
                'message' => 'Property not found'
            ], 404);
        }

        $user = Auth::user();

        if ($user->role !== 'student') {
            return response()->json([
                'success' => false,
                'message' => 'this user cant booking!'
            ], 400);
        }

        if ($property->status !== 'available') {
            return response()->json([
                'success' => false,
                'message' => 'Property is not available for rent'
            ], 400);
        }

        if ($property->available_spots <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'No available spots in this property'
            ], 400);
        }

        $existingRequest = RentalRequest::where('property_id', $propertyId)
            ->where('user_id', $user->id)
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        if ($existingRequest) {
            return response()->json([
                'success' => false,
                'message' => 'You already have an active request for this property'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'desired_start_date' => 'required|date|after_or_equal:today',
            'duration_months' => 'required|integer|min:1|max:60',
            'message' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $rentalRequest = RentalRequest::create([
            'property_id' => $propertyId,
            'user_id' => $user->id,
            'desired_start_date' => $request->desired_start_date,
            'duration_months' => $request->duration_months,
            'message' => $request->message,
            'status' => 'pending'
        ]);

        return response()->json([
            'success' => true,
            'data' => $rentalRequest,
            'message' => 'Rental request submitted successfully'
        ], 201);
    }

    public function approveRentalRequest(Request $request, $requestId)
    {
        $rentalRequest = RentalRequest::with('property')->find($requestId);

        if (!$rentalRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Rental request not found'
            ], 404);
        }

        $user = Auth::user();

        if ($rentalRequest->property->owner_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to approve this request'
            ], 403);
        }

        if ($rentalRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This request is no longer pending'
            ], 400);
        }

        DB::beginTransaction();

        try {
            $rentalRequest->update([
                'status' => 'approved',
                'owner_response' => $request->get('response_message', ''),
                'responded_at' => now()
            ]);

            $rental = PropertyRental::create([
                'property_id' => $rentalRequest->property_id,
                'tenant_id' => $rentalRequest->user_id,
                'owner_id' => $user->id,
                'start_date' => $rentalRequest->desired_start_date,
                'end_date' => \Carbon\Carbon::parse($rentalRequest->desired_start_date)
                    ->copy()
                    ->addMonths($rentalRequest->duration_months),
                'monthly_rent' => $rentalRequest->property->price,
                'security_deposit' => 0,
                'status' => 'active',
                'next_payment_date' => \Carbon\Carbon::parse($rentalRequest->desired_start_date)
                    ->copy()
                    ->addMonth(),
                'payment_method' => 'cash'
            ]);

            $property = $rentalRequest->property;
            $property->available_spots = max(0, $property->available_spots - 1);

            if ($property->available_spots <= 0) {
                $property->status = 'fully_occupied';
            } else {
                $property->status = 'partially_occupied';
            }

            $property->save();

            DB::commit();


            return response()->json([
                'success' => true,
                'data' => [
                    'rental_request' => $rentalRequest,
                    'rental_contract' => $rental
                ],
                'message' => 'Rental request approved successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve request: ' . $e->getMessage()
            ], 500);
        }
    }

    public function rejectRentalRequest(Request $request, $requestId)
    {
        $rentalRequest = RentalRequest::with('property')->find($requestId);

        if (!$rentalRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Rental request not found'
            ], 404);
        }

        $user = Auth::user();

        if ($rentalRequest->property->owner_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to reject this request'
            ], 403);
        }

        if ($rentalRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This request is no longer pending'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $rentalRequest->update([
            'status' => 'rejected',
            'owner_response' => $request->reason,
            'responded_at' => now()
        ]);

        // يمكنك إرسال إشعار للمستخدم هنا

        return response()->json([
            'success' => true,
            'message' => 'Rental request rejected successfully'
        ]);
    }

    public function getOwnerProperties(Request $request)
    {
        $user = Auth::user();

        $properties = Property::where('owner_id', $user->id)
            ->with([
                'city:id,name',
                'area:id,name',
                'images' => function ($q) {
                    $q->orderBy('priority')->limit(1);
                },
                'activeRentals.tenant:id,name,avatar',
                'rentalRequests' => function ($q) {
                    $q->where('status', 'pending')
                        ->with('user:id,name,avatar');
                }
            ])
            ->withCount(['activeRentals', 'rentalRequests as pending_requests'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $properties->getCollection()->transform(function ($property) {
            return [
                'id' => $property->id,
                'title' => $property->title,
                'price' => $property->price,
                'address' => $property->address,
                'city' => $property->city->name ?? '',
                'area' => $property->area->name ?? '',
                'status' => $property->status,
                'available_spots' => $property->available_spots,
                'available_rooms' => $property->available_rooms,
                'main_image' => $property->images->first() ?
                    asset('storage/' . $property->images->first()->path) :
                    null,
                'tenants_count' => $property->active_rentals_count,
                'pending_requests_count' => $property->pending_requests,
                'created_at' => $property->created_at->format('Y-m-d')
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $properties
        ]);
    }

    public function getTenantProperties(Request $request)
    {
        $user = Auth::user();

        $rentals = PropertyRental::where('tenant_id', $user->id)
            ->with([
                'property' => function ($q) {
                    $q->with([
                        'owner:id,name,phone,avatar',
                        'city:id,name',
                        'area:id,name',
                        'images' => function ($q) {
                            $q->orderBy('priority')->limit(1);
                        }
                    ]);
                }
            ])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $rentals->getCollection()->transform(function ($rental) {
            return [
                'id' => $rental->id,
                'property_id' => $rental->property_id,
                'property_title' => $rental->property->title,
                'property_address' => $rental->property->address,
                'property_city' => $rental->property->city->name ?? '',
                'property_area' => $rental->property->area->name ?? '',
                'monthly_rent' => $rental->monthly_rent,
                'start_date' => $rental->start_date,
                'end_date' => $rental->end_date,
                'status' => $rental->status,
                'next_payment_date' => $rental->next_payment_date,
                'property_image' => $rental->property->images->first() ?
                    asset('storage/' . $rental->property->images->first()->path) :
                    null,
                'owner_name' => $rental->property->owner->name,
                'owner_phone' => $rental->property->owner->phone,
                'owner_avatar' => $rental->property->owner->avatar ?
                    asset('storage/' . $rental->property->owner->avatar) :
                    null
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $rentals
        ]);
    }

    public function getOwnerStatistics()
    {
        $user = Auth::user();

        $totalProperties = Property::where('owner_id', $user->id)->count();
        $availableProperties = Property::where('owner_id', $user->id)
            ->where('status', 'available')
            ->count();
        $occupiedProperties = Property::where('owner_id', $user->id)
            ->whereIn('status', ['partially_occupied', 'fully_occupied'])
            ->count();

        $totalTenants = PropertyRental::where('owner_id', $user->id)
            ->where('status', 'active')
            ->count();

        $pendingRequests = RentalRequest::whereHas('property', function ($q) use ($user) {
            $q->where('owner_id', $user->id);
        })
            ->where('status', 'pending')
            ->count();

        $monthlyIncome = PropertyRental::where('owner_id', $user->id)
            ->where('status', 'active')
            ->sum('monthly_rent');

        return response()->json([
            'success' => true,
            'data' => [
                'total_properties' => $totalProperties,
                'available_properties' => $availableProperties,
                'occupied_properties' => $occupiedProperties,
                'total_tenants' => $totalTenants,
                'pending_requests' => $pendingRequests,
                'monthly_income' => $monthlyIncome
            ]
        ]);
    }

    public function terminateRental(Request $request, $rentalId)
    {
        $rental = PropertyRental::with('property')->find($rentalId);

        if (!$rental) {
            return response()->json([
                'success' => false,
                'message' => 'Rental contract not found'
            ], 404);
        }

        $user = Auth::user();

        if ($rental->owner_id !== $user->id && $rental->tenant_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to terminate this rental'
            ], 403);
        }

        if ($rental->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'This rental is not active'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'termination_date' => 'required|date|after_or_equal:today',
            'reason' => 'required|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            $rental->update([
                'end_date' => $request->termination_date,
                'status' => 'terminated',
                'notes' => ($rental->notes ? $rental->notes . "\n" : '') .
                    'Terminated on ' . now()->format('Y-m-d') .
                    '. Reason: ' . $request->reason
            ]);

            $property = $rental->property;
            $property->available_spots += 1;

            if ($property->status === 'fully_occupied') {
                $property->status = 'partially_occupied';
            } elseif ($property->available_spots === $property->total_rooms * 2) {
                $property->status = 'available';
            }

            $property->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Rental terminated successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to terminate rental: ' . $e->getMessage()
            ], 500);
        }
    }

    private function formatProperty($property, $detailed = false)
    {
        // دالة مساعدة للتحقق من العلاقات
        $safeCount = function ($relation) use ($property) {
            if (isset($property->{$relation . '_count'})) {
                return $property->{$relation . '_count'};
            }

            if ($property->relationLoaded($relation) && isset($property->{$relation})) {
                return $property->{$relation}->count();
            }

            return 0;
        };

        $safeMap = function ($relation, $callback) use ($property) {
            if ($property->relationLoaded($relation) && isset($property->{$relation})) {
                return $property->{$relation}->map($callback);
            }

            return [];
        };

        $safeGet = function ($value, $default = null) use ($property) {
            if (isset($property->{$value})) {
                return $property->{$value};
            }

            return $default;
        };

        $baseData = [
            'id' => $property->id,
            'title' => $property->title,
            'description' => $property->description,
            'price' => $property->price,
            'address' => $property->address,
            'gender_requirement' => $property->gender_requirement,
            'smoking_allowed' => (bool)$property->smoking_allowed,
            'pets_allowed' => (bool)$property->pets_allowed,
            'total_rooms' => (int)$property->total_rooms,
            'available_rooms' => (int)$property->available_rooms,
            'bathrooms_count' => (int)$property->bathrooms_count,
            'beds' => (int)$property->beds,
            'available_spots' => (int)$property->available_spots,
            'size' => (int)$property->size,
            'accommodation_type' => $property->accommodation_type,
            'university_id' => $property->university_id,
            'available_from' => $property->available_from ? $property->available_from->format('Y-m-d') : null,
            'available_to' => $property->available_to ? $property->available_to->format('Y-m-d') : null,
            'status' => $property->status,
            'created_at' => $property->created_at ? $property->created_at->diffForHumans() : null,
            'images' => $safeMap('images', function ($image) {
                return [
                    'id' => $image->id,
                    'url' => asset('storage/' . $image->path),
                    'thumbnail' => asset('storage/' . $image->path) . '?w=300&h=200&fit=crop',
                    'priority' => $image->priority
                ];
            }),
            'owner' => $property->owner ? [
                'id' => $property->owner->id,
                'name' => $property->owner->name,
                'phone' => $property->owner->phone,
                'avatar' => $property->owner->avatar ? asset('storage/' . $property->owner->avatar) : null,
                'rating' => $property->owner->rating ?? 0
            ] : null,
            'location' => [
                'city' => [
                    'id' => $property->city_id,
                    'name' => $property->city->name ?? ''
                ],
                'area' => [
                    'id' => $property->area_id,
                    'name' => $property->area->name ?? ''
                ]
            ],
            'amenities' => $safeMap('amenities', function ($amenity) {
                return [
                    'id' => $amenity->id,
                    'name' => $amenity->name,
                    'icon' => $amenity->icon
                ];
            }),
            'current_tenants_count' => $safeCount('activeRentals')
        ];

        if ($detailed) {
            $detailedData = [
                'rentals' => $safeMap('activeRentals', function ($rental) {
                    return [
                        'id' => $rental->id,
                        'tenant' => $rental->tenant ? [
                            'id' => $rental->tenant->id,
                            'name' => $rental->tenant->name,
                            'avatar' => $rental->tenant->avatar ? asset('storage/' . $rental->tenant->avatar) : null
                        ] : null,
                        'start_date' => $rental->start_date,
                        'end_date' => $rental->end_date,
                        'monthly_rent' => $rental->monthly_rent,
                        'room_number' => $rental->room_number,
                        'next_payment_date' => $rental->next_payment_date
                    ];
                }),
                'pending_requests' => $safeMap('rentalRequests', function ($request) {
                    return [
                        'id' => $request->id,
                        'user' => $request->user ? [
                            'id' => $request->user->id,
                            'name' => $request->user->name,
                            'avatar' => $request->user->avatar ? asset('storage/' . $request->user->avatar) : null
                        ] : null,
                        'desired_start_date' => $request->desired_start_date,
                        'duration_months' => $request->duration_months,
                        'message' => $request->message,
                        'created_at' => $request->created_at->diffForHumans()
                    ];
                })
            ];

            return array_merge($baseData, $detailedData);
        }

        return $baseData;
    }

    private function getFilters()
    {
        $cities = City::select('id', 'name')->get();
        $areas = Area::select('id', 'name', 'city_id')->get();

        return [
            'cities' => $cities,
            'areas' => $areas,
            'accommodation_types' => [
                'apartment',
                'villa',
                'studio',
                'shared_room',
                'private_room',
                'hostel'
            ],
            'price_ranges' => [
                ['min' => 0, 'max' => 1000, 'label' => '0 - 1,000'],
                ['min' => 1000, 'max' => 2000, 'label' => '1,000 - 2,000'],
                ['min' => 2000, 'max' => 3000, 'label' => '2,000 - 3,000'],
                ['min' => 3000, 'max' => 5000, 'label' => '3,000 - 5,000'],
                ['min' => 5000, 'max' => null, 'label' => '5,000+'],
            ],
            'rooms_options' => [1, 2, 3, 4, 5],
            'sort_options' => [
                ['value' => 'newest', 'label' => 'Newest'],
                ['value' => 'price_low', 'label' => 'Price: Low to High'],
                ['value' => 'price_high', 'label' => 'Price: High to Low'],
                ['value' => 'available_spots', 'label' => 'Most Available Spots']
            ]
        ];
    }


    public function filterProperties(Request $request)
    {
        try {
            $query = Property::with(['area.city', 'owner', 'images', 'amenities'])
                ->where('admin_approval_status', 'approved');

            if ($request->has('university_id') && $request->university_id) {
                $query->where('university_id', $request->university_id);
            }

            if ($request->has('accommodation_type') && $request->accommodation_type) {
                $query->where('accommodation_type', $request->accommodation_type);
            }

            if ($request->has('gender_requirement') && $request->gender_requirement) {
                $query->where('gender_requirement', $request->gender_requirement);
            }

            if ($request->has('min_price') && $request->min_price) {
                $query->where('price', '>=', $request->min_price);
            }
            if ($request->has('max_price') && $request->max_price) {
                $query->where('price', '<=', $request->max_price);
            }

            if ($request->has('min_available_spots') && $request->min_available_spots) {
                $query->where('available_spots', '>=', $request->min_available_spots);
            }
            if ($request->has('max_available_spots') && $request->max_available_spots) {
                $query->where('available_spots', '<=', $request->max_available_spots);
            }

            if ($request->has('min_beds') && $request->min_beds) {
                $query->where('beds', '>=', $request->min_beds);
            }
            if ($request->has('max_beds') && $request->max_beds) {
                $query->where('beds', '<=', $request->max_beds);
            }

            if ($request->has('min_rooms') && $request->min_rooms) {
                $query->where('total_rooms', '>=', $request->min_rooms);
            }
            if ($request->has('max_rooms') && $request->max_rooms) {
                $query->where('total_rooms', '<=', $request->max_rooms);
            }

            if ($request->has('pets_allowed') && $request->pets_allowed !== null) {
                $query->where('pets_allowed', $request->pets_allowed);
            }

            if ($request->has('smoking_allowed') && $request->smoking_allowed !== null) {
                $query->where('smoking_allowed', $request->smoking_allowed);
            }

            if ($request->has('city_id') && $request->city_id) {
                $query->whereHas('area.city', function ($q) use ($request) {
                    $q->where('id', $request->city_id);
                });
            }

            if ($request->has('area_id') && $request->area_id) {
                $query->where('area_id', $request->area_id);
            }

            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');

            if ($sortBy === 'price_asc') {
                $query->orderBy('price', 'asc');
            } elseif ($sortBy === 'price_desc') {
                $query->orderBy('price', 'desc');
            } else {
                $query->orderBy($sortBy, $sortOrder);
            }

            $perPage = $request->get('per_page', 12);
            $properties = $query->paginate($perPage);

            $cities = City::all();
            $areas = Area::all();
            $universities = University::all();
            $accommodationTypes = Property::select('accommodation_type')
                ->whereNotNull('accommodation_type')
                ->distinct()
                ->pluck('accommodation_type');

            $response = [
                'success' => true,
                'data' => [
                    'data' => $properties->items(),
                    'current_page' => $properties->currentPage(),
                    'last_page' => $properties->lastPage(),
                    'per_page' => $properties->perPage(),
                    'total' => $properties->total(),
                ],
                'filters' => [
                    'cities' => $cities,
                    'areas' => $areas,
                    'universities' => $universities,
                    'accommodation_types' => $accommodationTypes,
                    'price_ranges' => [
                        ['min' => 100, 'max' => 300, 'label' => '100-300'],
                        ['min' => 300, 'max' => 500, 'label' => '300-500'],
                        ['min' => 500, 'max' => 700, 'label' => '500-700'],
                        ['min' => 700, 'max' => 1000, 'label' => '700+'],
                    ],
                    'rooms_options' => [1, 2, 3, 4, 5, 6],
                    'sort_options' => [
                        ['value' => 'price_asc', 'label' => 'Price: Low to High'],
                        ['value' => 'price_desc', 'label' => 'Price: High to Low'],
                        ['value' => 'created_at_desc', 'label' => 'Newest First'],
                        ['value' => 'available_spots_desc', 'label' => 'Most Available Spots'],
                    ]
                ]
            ];

            return response()->json($response);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error filtering properties',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getOwnerProperty($id)
    {
        $user = Auth::user();

        $property = Property::where('id', $id)
            ->where('owner_id', $user->id)
            ->with([
                'owner:id,name,phone,avatar,email',
                'city:id,name',
                'area:id,name',
                'images' => function ($q) {
                    $q->orderBy('priority');
                },
                'amenities',
                'activeRentals.tenant:id,name,avatar',
                'rentalRequests' => function ($q) {
                    $q->where('status', 'pending')
                        ->with('user:id,name,avatar');
                }
            ])
            ->first();

        if (!$property) {
            return response()->json([
                'success' => false,
                'message' => 'Property not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $property
        ]);
    }
}
