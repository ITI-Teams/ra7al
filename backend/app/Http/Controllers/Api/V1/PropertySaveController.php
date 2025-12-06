<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PropertySaveController extends Controller
{
    public function toggle($propertyId)
    {
        $property = Property::find($propertyId);
        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        $user = Auth::user();
        $isSaved = $property->savedByUsers()->where('user_id', $user->id)->exists();

        if ($isSaved) {
            $property->savedByUsers()->detach($user->id);
            $isSaved = false;
            $message = 'Removed from favourites';
        } else {
            $property->savedByUsers()->attach($user->id);
            $isSaved = true;
            $message = 'Added to favourites';
        }

        return response()->json([
            'message' => $message,
            'is_favourite' => $isSaved,
        ]);
    }

    // public function myFavourites()
    // {
    //     $user = Auth::user();

    //     $properties = $user->savedProperties()
    //         ->with('images') // ترجع الصور أيضاً
    //         ->get();

    //     return response()->json($properties);
    // }

    // public function myFavourites()
    // {
    //     $user = Auth::user();
    //     return response()->json($user->savedProperties);
    // }

    // public function myFavourites()
    // {
    //     $user = Auth::user();
    //     $default = asset('images/default-avatar.png');
    //     // جلب الخصائص المحفوظة مع الصور
    //     $properties = $user->savedProperties()
    //         ->with('images') // ترجع كل الصور
    //         ->get()
    //         ->map(function ($property) {
    //             // تعديل مسار الصور ليكون رابط كامل
    //             $property->images = $property->images->map(function ($image) {
    //                 $image->path = asset('storage/' . $image->path);
    //                 return $image;
    //             });

    //             return $property;
    //         });

    //     return response()->json($properties);
    // }

    // public function myFavourites()
    // {
    //     $user = Auth::user();


    //     // جلب الخصائص المحفوظة مع الصور
    //     $properties = $user->savedProperties()
    //         ->with('images') // ترجع كل الصور
    //         ->get()
    //         ->map(function ($property) use ($default) {

    //             if ($property->images->isEmpty()) {
    //                 // لو مفيش صور، خلي الصورة الافتراضية
    //                 $property->images = collect([
    //                     (object) ['path' => $default]
    //                 ]);
    //             } else {
    //                 // تعديل مسار الصور ليكون رابط كامل
    //                 $property->images = $property->images->map(function ($image) {
    //                     $image->path = asset('storage/' . $image->path);
    //                     return $image;
    //                 });
    //             }

    //             return $property;
    //         });

    //     return response()->json($properties);
    // }

    public function myFavourites()
    {
        $user = Auth::user();

        $properties = $user->savedProperties()
            ->with('images')
            ->get()
            ->map(function ($property) {

                $property->images = $property->images->map(function ($image) {
                    $image->path = asset('storage/' . $image->path);
                    return $image;
                });

                return $property;
            });

        return response()->json($properties);
    }
}
