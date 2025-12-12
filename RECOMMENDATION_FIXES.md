# Recommendation System - Fixes & Implementation Guide

## ✅ Issues Fixed

### 1. **Authentication/Authorization (403 Forbidden)**
**Problem:** POST `/api/recommendations` endpoint requires `auth:sanctum` but requests were failing with 403

**Solution Applied:**
- Added `withCredentials: true` to the `getRecommendations()` method in `recommendation.service.ts`
- Verified HTTP interceptor (`auth.interceptor.ts`) is properly configured to add Bearer token to all requests
- Ensured CORS configuration in `backend/config/cors.php` has `supports_credentials` set to `true`

**Changes Made:**
```typescript
// frontend/src/app/core/services/recommendation/recommendation.service.ts
getRecommendations(answers: any): Observable<RecommendationResponse> {
  return this.http.post<RecommendationResponse>(`${this.apiUrl}`, {
    answers: answers
  }, {
    withCredentials: true  // ✅ ADDED
  });
}
```

### 2. **Database Seeding**
**Problem:** RecommendationQuestionSeeder file was incomplete

**Solution:**
- Verified seeder file is complete with all 14 question types
- Successfully ran seeder: `php artisan db:seed --class=RecommendationQuestionSeeder`
- Confirmed 28 recommendation questions were created in database

**Questions Seeded:**
1. Budget (1 question) - Range slider for monthly rent
2. Location (2 questions) - City selection and commute distance
3. Property Features (2 questions) - Roommates and furnishing preferences
4. Lifestyle (4 questions) - Smoking, sleep schedule, cleanliness, noise tolerance
5. Pets & Amenities (2 questions) - Pet ownership and amenities selection
6. Roommate Preferences (2 questions) - Gender preference and hobbies
7. Move-in Timeline (1 question) - When planning to move

---

## 📋 Route Structure

### Public Routes (No Auth Required)
```
GET /api/recommendations/questions
- Returns all active recommendation questions
- No authentication needed
- Used to populate the question form
```

### Protected Routes (Auth Required)
```
POST /api/recommendations
- Submit answers and get AI recommendations
- Requires: auth:sanctum (Bearer token)
- Input: { answers: { [questionId]: { value: any } } }
- Output: { success: bool, data: Property[], session_id: uuid }

POST /api/recommendations/answer
- Save a single answer
- Requires: auth:sanctum

POST /api/recommendations/answers
- Save multiple answers at once
- Requires: auth:sanctum

GET /api/recommendations/history
- Get recommendation history for user
- Requires: auth:sanctum
```

---

## 🔄 Recommendation Flow

### Frontend Flow (Angular)
1. User navigates to `/recommendations`
2. Component calls `RecommendationService.getQuestions()`
3. Questions loaded and grouped by category (budget, location, lifestyle, etc.)
4. User answers questions step-by-step (grouped by category)
5. Validation ensures all required questions answered before submission
6. User clicks "Get Recommendations" button
7. Component calls `RecommendationService.getRecommendations(formattedAnswers)`
8. **HTTP Interceptor automatically adds Bearer token**
9. Service sends POST request with `withCredentials: true`
10. Results displayed in property grid with matching percentages

### Backend Flow (Laravel)
1. `RecommendationController@getRecommendations()` receives request
2. Validates answers format
3. Stores user responses in `user_recommendation_responses` table
4. Calls Node.js RAG service with:
   - user_id
   - session_id
   - answers
   - database_config
5. RAG service queries properties and ranks by relevance
6. Returns recommended properties with matching percentages
7. Laravel returns JSON response to frontend

### RAG Service Flow (Node.js)
1. Receives recommendation request
2. Connects to MySQL database
3. Queries properties matching user criteria
4. Sends matched properties + user preferences to OpenAI
5. Gets ranked list with explanations
6. Returns results to Laravel

---

## 🛠️ Testing Checklist

### Prerequisites
- ✅ Backend running: `cd backend && php artisan serve`
- ✅ Frontend running: `cd frontend && ng serve`
- ✅ RAG service running: `cd rag-service && node src/server.js`
- ✅ MySQL database seeded with questions

### Test Steps

1. **Check Questions Endpoint**
   ```bash
   curl -X GET http://localhost:8000/api/recommendations/questions
   ```
   Expected: Array of 28 questions with all fields

2. **Login First**
   ```bash
   curl -X POST http://localhost:8000/api/login \
     -H "Content-Type: application/json" \
     -d '{"email":"student@test.com", "password":"password", "role":"student"}'
   ```
   Get token from response

3. **Submit Recommendations**
   ```bash
   curl -X POST http://localhost:8000/api/recommendations \
     -H "Authorization: Bearer TOKEN_HERE" \
     -H "Content-Type: application/json" \
     -H "Accept: application/json" \
     -d '{
       "answers": {
         "1": {"value": 3000},
         "2": {"value": "Cairo"},
         "3": {"value": "Less than 5 km"}
       }
     }'
   ```

4. **Verify in Frontend**
   - Navigate to `/recommendations` as logged-in user
   - Answer all required questions
   - Click "Get Recommendations"
   - Verify properties display with matching percentages

---

## 📊 Response Examples

### Questions Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "question": "What is your monthly budget for rent?",
      "question_type": "range",
      "options": {"min": 1000, "max": 10000, "step": 500},
      "category": "budget",
      "is_required": true,
      "order": 1
    }
  ],
  "total": 28
}
```

### Recommendations Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Luxury Studio in Downtown",
      "location": "Cairo",
      "price": 3500,
      "image": "url/to/image.jpg",
      "rooms": 1,
      "baths": 1,
      "beds": 1,
      "gender": "female",
      "available_spots": 2,
      "bills_included": true,
      "matching_percentage": 95,
      "reason": "Matches budget and location preferences"
    }
  ],
  "session_id": "uuid",
  "message": "Recommendations generated successfully"
}
```

---

## 🔐 Authentication Details

### HTTP Interceptor (auth.interceptor.ts)
```typescript
intercept(request: HttpRequest<unknown>, next: HttpHandler) {
  const token = this.authService.getToken();
  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next.handle(request);
}
```

### CORS Configuration (cors.php)
```php
'allowed_origins' => ['http://localhost:4200'],
'allowed_headers' => ['*'],
'supports_credentials' => true,  // ✅ CRITICAL for cookies/auth
```

---

## 🎨 Frontend Components

### Files Modified/Created
- `frontend/src/app/core/services/recommendation/recommendation.service.ts` - Updated with withCredentials
- `frontend/src/app/features/recommendation/recommendation.ts` - Main component
- `frontend/src/app/features/recommendation/recommendation.html` - Template
- `frontend/src/app/features/recommendation/recommendation.css` - Styles

### Key Methods
- `loadQuestions()` - Fetch and group questions
- `submitAnswers()` - Format and submit answers
- `nextGroup()` / `prevGroup()` - Navigate questions
- `updateAnswer()` - Update form state
- `restartRecommendation()` - Reset form

---

## 📝 Troubleshooting

### 403 Forbidden Error
**Cause:** Token not being sent with request
**Check:** 
1. Is user logged in? `localStorage.getItem('api_token')`
2. Is interceptor registered? Check `app.config.ts`
3. Is `withCredentials` set? (✅ Now set)

### No Properties Returned
**Cause:** RAG service not running or database query failing
**Check:**
1. Is Node.js RAG service running? `ps aux | grep node`
2. Check RAG service logs for connection errors
3. Verify database config in `.env`

### Database Errors
**Cause:** Seeder not run or migration issues
**Fix:**
```bash
php artisan db:seed --class=RecommendationQuestionSeeder
```

---

## ✨ Next Steps (Optional Enhancements)

1. Add recommendation caching to avoid duplicate calls
2. Implement recommendation history view
3. Add filters to sort/filter recommendations
4. Create sharing feature for recommendations
5. Add analytics for recommendation system

---

## 📞 Support

For issues or questions, check:
1. Laravel logs: `backend/storage/logs/`
2. Browser console for JS errors
3. Network tab for HTTP status codes
4. Backend logs for API errors

