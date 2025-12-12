# Recommendation Questions API

## Overview
The Recommendation Questions API allows users to answer recommendation questions and receive AI-powered property recommendations based on their preferences.

---

## Endpoints

### 1. Get All Questions
**GET** `/api/recommendations/questions`

**Authentication:** Not required  
**Description:** Retrieve all active recommendation questions

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "question": "What is your monthly budget for rent?",
      "question_type": "range",
      "options": {
        "min": 1000,
        "max": 10000,
        "step": 500
      },
      "category": "budget",
      "is_required": true,
      "order": 1
    }
  ],
  "total": 14
}
```

---

### 2. Answer a Single Question
**POST** `/api/recommendations/answer`

**Authentication:** Required (Bearer token)  
**Description:** Save answer to a single recommendation question

**Request Body:**
```json
{
  "question_id": 1,
  "response": {
    "value": "Cairo"
  },
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Answer saved successfully",
  "data": {
    "response_id": 5,
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "question_id": 1,
    "saved_at": "2024-12-11T10:30:45.000000Z"
  }
}
```

**Validation Errors (422):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "question_id": ["The selected question_id is invalid."],
    "response": ["The response field is required."]
  }
}
```

---

### 3. Answer Multiple Questions
**POST** `/api/recommendations/answers`

**Authentication:** Required (Bearer token)  
**Description:** Save answers to multiple questions at once

**Request Body:**
```json
{
  "answers": [
    {
      "question_id": 1,
      "response": {
        "value": "Cairo"
      }
    },
    {
      "question_id": 2,
      "response": {
        "value": 3000
      }
    },
    {
      "question_id": 11,
      "response": {
        "value": ["WiFi", "Gym", "Swimming Pool"]
      }
    }
  ],
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Answers saved successfully",
  "data": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "answers_saved": 3,
    "responses": [
      {
        "response_id": 5,
        "question_id": 1
      },
      {
        "response_id": 6,
        "question_id": 2
      },
      {
        "response_id": 7,
        "question_id": 11
      }
    ],
    "saved_at": "2024-12-11T10:30:45.000000Z"
  }
}
```

---

### 4. Get AI Recommendations
**POST** `/api/recommendations`

**Authentication:** Required (Bearer token)  
**Description:** Submit all answers and get AI-powered property recommendations

**Request Body:**
```json
{
  "answers": {
    "1": {
      "value": "Cairo"
    },
    "2": {
      "value": 3000
    },
    "3": {
      "value": ["Less than 5 km"]
    },
    "11": {
      "value": ["WiFi", "Gym"]
    }
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "property_id": 15,
      "title": "Modern Studio in Nasr City",
      "price": 2800,
      "city": "Cairo",
      "area": "Nasr City",
      "match_score": 0.95,
      "explanation": "This property perfectly matches your budget and location preferences..."
    }
  ],
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Recommendations generated successfully"
}
```

---

### 5. Get Answer History
**GET** `/api/recommendations/history`

**Authentication:** Required (Bearer token)  
**Description:** Retrieve user's recommendation answer history

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "session_id": "550e8400-e29b-41d4-a716-446655440000",
      "completed_at": "2024-12-11T10:30:45.000000Z",
      "answers_count": 3,
      "answers": [
        {
          "question": "What is your monthly budget for rent?",
          "category": "budget",
          "response": {
            "value": "Cairo"
          }
        }
      ]
    }
  ]
}
```

---

## Question Types

### 1. **range**
For numeric range questions (budget, distance, etc.)
```json
{
  "options": {
    "min": 1000,
    "max": 10000,
    "step": 500
  }
}
```
Response format:
```json
{
  "value": 3000
}
```

### 2. **single_choice**
For questions with one correct answer
```json
{
  "options": ["Cairo", "Alexandria", "Giza", "Mansoura"]
}
```
Response format:
```json
{
  "value": "Cairo"
}
```

### 3. **multiple_choice**
For questions with multiple correct answers
```json
{
  "options": ["WiFi", "Gym", "Swimming Pool", "Parking"]
}
```
Response format:
```json
{
  "value": ["WiFi", "Gym"]
}
```

### 4. **boolean**
For yes/no questions
```json
{
  "options": null
}
```
Response format:
```json
{
  "value": true
}
```

---

## Categories

The recommendation questions are organized into categories:
- **budget** - Budget-related questions
- **location** - Location and area preferences
- **property_features** - Property characteristics (rooms, furnishing, etc.)
- **lifestyle** - Personal lifestyle preferences (smoking, sleep schedule, etc.)
- **amenities** - Desired amenities
- **roommate_preferences** - Preferences for roommates

---

## Error Handling

### 401 Unauthorized
```json
{
  "message": "Unauthenticated."
}
```

### 404 Not Found
```json
{
  "message": "Not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to save answer",
  "error": "..." // Only shown in debug mode
}
```

---

## Usage Example (cURL)

### Get all questions:
```bash
curl -X GET http://localhost:8000/api/recommendations/questions
```

### Answer a single question:
```bash
curl -X POST http://localhost:8000/api/recommendations/answer \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question_id": 1,
    "response": {"value": "Cairo"},
    "session_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### Answer multiple questions:
```bash
curl -X POST http://localhost:8000/api/recommendations/answers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {"question_id": 1, "response": {"value": "Cairo"}},
      {"question_id": 2, "response": {"value": 3000}},
      {"question_id": 11, "response": {"value": ["WiFi", "Gym"]}}
    ]
  }'
```

### Get history:
```bash
curl -X GET http://localhost:8000/api/recommendations/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Database Models

- **RecommendationQuestion** - Stores all recommendation questions
- **UserRecommendationResponse** - Stores user answers to questions
  - `user_id` - User who answered
  - `question_id` - Question answered
  - `response` - User's response (stored as JSON)
  - `session_id` - Groups related answers together
  - `completed_at` - When the answer was saved

---

## Notes

- A `session_id` is automatically generated if not provided
- Sessions group related answers together for recommendation generation
- All responses are stored in the database for future reference and AI training
- Questions marked as `is_required: true` must be answered before getting recommendations
