<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;



class MessageController extends Controller
{
    // GET /api/messages
    public function index(): JsonResponse
    {
        $messages = Message::latest()->paginate(10);

        return response()->json([
            'success' => true,
            'data' => MessageResource::collection($messages),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
                'total' => $messages->total(),
            ]
        ]);
    }

    // POST /api/messages
    public function store(StoreMessageRequest $request): JsonResponse
    {
        $data = $request->validated();

        $data['user_id'] = Auth::check() ? Auth::id() : null;

        $message = Message::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Message sent successfully.',
            'data' => new MessageResource($message),
        ], 201);
    }
}
