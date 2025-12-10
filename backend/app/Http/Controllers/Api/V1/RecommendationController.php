<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RecommendationQuestion;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class RecommendationController extends Controller
{
    /**
     * Get all active recommendation questions
     *
     * Endpoint: GET /api/recommendation-questions
     *
     * @return JsonResponse
     */
    public function getQuestions(): JsonResponse
    {
        try {
            // Fetch all active questions ordered by display order
            $questions = RecommendationQuestion::active()
                ->ordered()
                ->get()
                ->map(function ($question) {
                    return [
                        'id' => $question->id,
                        'question' => $question->question,
                        'question_type' => $question->question_type,
                        'options' => $question->options,
                        'category' => $question->category,
                        'is_required' => $question->is_required,
                        'order' => $question->order,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $questions,
                'total' => $questions->count(),
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching recommendation questions: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch questions',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Submit answers and get AI-powered property recommendations
     *
     * Endpoint: POST /api/recommendations
     *
     * Expected Request Body:
     * {
     *   "answers": {
     *     "1": {"value": "Cairo"},
     *     "2": {"value": 3000, "max": 5000},
     *     "3": {"value": ["WiFi", "Gym"]}
     *   }
     * }
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getRecommendations(Request $request): JsonResponse
    {
        try {
            // Validate request
            $validated = $request->validate([
                'answers' => 'required|array',
                'answers.*' => 'required',
            ]);

            // Generate unique session ID for this recommendation request
            $sessionId = Str::uuid()->toString();

            // Store user responses in database for future reference
            $this->storeUserResponses(
                $request->user()->id,
                $validated['answers'],
                $sessionId
            );

            // Call Node.js RAG service to get recommendations
            $recommendations = $this->callRAGService(
                $validated['answers'],
                $request->user()->id,
                $sessionId
            );

            return response()->json([
                'success' => true,
                'data' => $recommendations,
                'session_id' => $sessionId,
                'message' => 'Recommendations generated successfully',
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error generating recommendations: ' . $e->getMessage(), [
                'user_id' => $request->user()?->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate recommendations',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Store user responses to recommendation questions
     *
     * @param int $userId
     * @param array $answers
     * @param string $sessionId
     * @return void
     */
    private function storeUserResponses(int $userId, array $answers, string $sessionId): void
    {
        foreach ($answers as $questionId => $response) {
            \App\Models\UserRecommendationResponse::updateOrCreate(
                [
                    'user_id' => $userId,
                    'question_id' => $questionId,
                    'session_id' => $sessionId,
                ],
                [
                    'response' => $response,
                    'completed_at' => now(),
                ]
            );
        }
    }

    /**
     * Call Node.js RAG service to get AI-powered recommendations
     *
     * This sends user answers to our Node.js microservice which:
     * 1. Queries database for matching properties
     * 2. Sends properties + user preferences to OpenAI
     * 3. Gets ranked recommendations with explanations
     *
     * @param array $answers
     * @param int $userId
     * @param string $sessionId
     * @return array
     * @throws \Exception
     */
    private function callRAGService(array $answers, int $userId, string $sessionId): array
    {
        // Node.js RAG service URL (from .env)
        $ragServiceUrl = config('services.rag.url') . '/api/recommend';

        try {
            // Make HTTP request to Node.js service
            $response = Http::timeout(30) // 30 second timeout for AI processing
                ->retry(2, 1000) // Retry twice with 1 second delay
                ->post($ragServiceUrl, [
                    'user_id' => $userId,
                    'session_id' => $sessionId,
                    'answers' => $answers,
                    'database_config' => [
                        'host' => config('database.connections.mysql.host'),
                        'port' => config('database.connections.mysql.port'),
                        'database' => config('database.connections.mysql.database'),
                        'username' => config('database.connections.mysql.username'),
                        'password' => config('database.connections.mysql.password'),
                    ],
                ]);

            if (!$response->successful()) {
                throw new \Exception('RAG service returned error: ' . $response->body());
            }

            $data = $response->json();

            if (!isset($data['success']) || !$data['success']) {
                throw new \Exception('RAG service failed: ' . ($data['message'] ?? 'Unknown error'));
            }

            return $data['data'];
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('Cannot connect to RAG service: ' . $e->getMessage());
            throw new \Exception('Recommendation service is currently unavailable. Please try again later.');
        } catch (\Illuminate\Http\Client\RequestException $e) {
            Log::error('RAG service request failed: ' . $e->getMessage());
            throw new \Exception('Failed to process recommendations. Please try again.');
        }
    }

    /**
     * Answer a single recommendation question
     *
     * Endpoint: POST /api/recommendations/answer
     *
     * Expected Request Body:
     * {
     *   "question_id": 1,
     *   "response": {"value": "Cairo"},
     *   "session_id": "uuid" (optional)
     * }
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function answerQuestion(Request $request): JsonResponse
    {
        try {
            // Validate request
            $validated = $request->validate([
                'question_id' => 'required|integer|exists:recommendation_questions,id',
                'response' => 'required',
                'session_id' => 'sometimes|string|uuid',
            ]);

            $userId = $request->user()->id;
            $sessionId = $validated['session_id'] ?? Str::uuid()->toString();

            // Verify question exists and is active
            $question = RecommendationQuestion::active()
                ->findOrFail($validated['question_id']);

            // Store the response
            $userResponse = \App\Models\UserRecommendationResponse::updateOrCreate(
                [
                    'user_id' => $userId,
                    'question_id' => $validated['question_id'],
                    'session_id' => $sessionId,
                ],
                [
                    'response' => $validated['response'],
                    'completed_at' => now(),
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Answer saved successfully',
                'data' => [
                    'response_id' => $userResponse->id,
                    'session_id' => $sessionId,
                    'question_id' => $validated['question_id'],
                    'saved_at' => $userResponse->completed_at,
                ],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error saving answer: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to save answer',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Answer multiple recommendation questions at once
     *
     * Endpoint: POST /api/recommendations/answers
     *
     * Expected Request Body:
     * {
     *   "answers": [
     *     {"question_id": 1, "response": {"value": "Cairo"}},
     *     {"question_id": 2, "response": {"value": 3000}},
     *     {"question_id": 3, "response": {"value": ["WiFi", "Gym"]}}
     *   ],
     *   "session_id": "uuid" (optional)
     * }
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function answerMultipleQuestions(Request $request): JsonResponse
    {
        try {
            // Validate request
            $validated = $request->validate([
                'answers' => 'required|array|min:1',
                'answers.*.question_id' => 'required|integer|exists:recommendation_questions,id',
                'answers.*.response' => 'required',
                'session_id' => 'sometimes|string|uuid',
            ]);

            $userId = $request->user()->id;
            $sessionId = $validated['session_id'] ?? Str::uuid()->toString();

            $savedResponses = [];

            foreach ($validated['answers'] as $answer) {
                // Verify question exists and is active
                $question = RecommendationQuestion::active()
                    ->findOrFail($answer['question_id']);

                // Store the response
                $userResponse = \App\Models\UserRecommendationResponse::updateOrCreate(
                    [
                        'user_id' => $userId,
                        'question_id' => $answer['question_id'],
                        'session_id' => $sessionId,
                    ],
                    [
                        'response' => $answer['response'],
                        'completed_at' => now(),
                    ]
                );

                $savedResponses[] = [
                    'response_id' => $userResponse->id,
                    'question_id' => $answer['question_id'],
                ];
            }

            return response()->json([
                'success' => true,
                'message' => 'Answers saved successfully',
                'data' => [
                    'session_id' => $sessionId,
                    'answers_saved' => count($savedResponses),
                    'responses' => $savedResponses,
                    'saved_at' => now(),
                ],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error saving answers: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to save answers',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get user's recommendation history
     *
     * Endpoint: GET /api/recommendations/history
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getHistory(Request $request): JsonResponse
    {
        try {
            $userId = $request->user()->id;

            // Get unique sessions with their responses
            $history = \App\Models\UserRecommendationResponse::where('user_id', $userId)
                ->with('question:id,question,category')
                ->whereNotNull('completed_at')
                ->orderBy('completed_at', 'desc')
                ->get()
                ->groupBy('session_id')
                ->map(function ($responses, $sessionId) {
                    return [
                        'session_id' => $sessionId,
                        'completed_at' => $responses->first()->completed_at,
                        'answers_count' => $responses->count(),
                        'answers' => $responses->map(function ($response) {
                            return [
                                'question' => $response->question->question,
                                'category' => $response->question->category,
                                'response' => $response->response,
                            ];
                        }),
                    ];
                })
                ->values();

            return response()->json([
                'success' => true,
                'data' => $history,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching recommendation history: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch history',
            ], 500);
        }
    }
}
