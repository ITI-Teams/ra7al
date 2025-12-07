<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Property;
use App\Models\PropertyComment;

class PropertyCommentController extends Controller
{
    /** 
     *      * Add comment to property
     * 
     * POST /api/properties/{id}/comments
     */
    public function addComment(Request $request, int $id)
    {
        try {
            $validated = $request->validate([
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'required|string|max:1000',
            ]);

            $property = Property::findOrFail($id);

            // Check if user already commented
            $existingComment = PropertyComment::where('property_id', $id)
                ->where('user_id', auth()->id())
                ->first();

            if ($existingComment) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already commented on this property',
                ], 422);
            }

            $comment = PropertyComment::create([
                'property_id' => $id,
                'user_id' => auth()->id(),
                'rating' => $validated['rating'],
                'comment' => $validated['comment'],
            ]);

            // Load user relationship
            $comment->load('user');

            return response()->json([
                'success' => true,
                'message' => 'Comment added successfully',
                'data' => $comment,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error adding comment: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to add comment',
            ], 500);
        }
    }
}
