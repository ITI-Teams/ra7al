# Recommendations Page - Implementation Guide

## 📋 Overview
The Recommendations page is a comprehensive feature that helps users find the perfect accommodation by answering targeted questions, processing responses through RAG (Retrieval-Augmented Generation), and displaying personalized property recommendations.

---

## 🏗️ Architecture

### Components Created

1. **RecommendationComponent** (`recommendation.ts`)
   - Main component handling the entire recommendation flow
   - Manages question groups, form state, and results display
   - Integrates with services and handles user interactions

2. **RecommendationService** (`recommendation.service.ts`)
   - API communication for fetching questions
   - Submitting answers to the backend
   - Question grouping and categorization utilities

3. **HTML Template** (`recommendation.html`)
   - Two-phase UI: Questions phase and Results phase
   - Step-by-step grouped questions interface
   - Property card grid with matching percentages
   - Progress tracking and navigation

4. **Styles** (`recommendation.css`)
   - Dark mode support
   - Smooth animations and transitions
   - Responsive design (mobile-first)
   - Custom form controls and property cards

---

## 🔄 User Flow

### Phase 1: Questions
1. User navigates to `/recommendations`
2. Questions are fetched from `GET /api/recommendations/questions`
3. Questions are automatically grouped by category
4. User answers questions group-by-group (step-by-step)
5. Progress bar shows current progress
6. Can navigate between groups using Previous/Next buttons
7. All required questions must be answered before proceeding
8. Final group shows "Get Recommendations" button instead of Next

### Phase 2: RAG Processing
1. When user clicks "Get Recommendations", answers are formatted and sent to `POST /api/recommendations`
2. Backend RAG service processes answers and queries database
3. OpenAI ranks properties based on user preferences
4. Results are returned with matching percentages

### Phase 3: Results Display
1. Recommended properties are displayed as cards
2. Each card shows:
   - Property image with gradient overlay
   - Matching percentage in top-right corner (green badge)
   - Available spots badge
   - Bills included indicator
   - Property details (rooms, baths, beds)
   - Gender requirement
   - Monthly price
   - Quick view button
   - Optional: Reason for recommendation (from RAG)
3. Cards are paginated (6 per page by default)
4. User can:
   - Save recommendations to localStorage
   - Start a new search
   - View property details

---

## 💾 Data Structure

### Question Object
```typescript
interface RecommendationQuestion {
  id: number;
  question: string;
  question_type: 'text' | 'select' | 'multi_select' | 'range';
  options?: any[];
  category: string;
  is_required: boolean;
  order: number;
}
```

### Form Answers
```typescript
interface FormAnswers {
  [questionId: number]: any; // value depends on question_type
}
```

### Recommended Property
```typescript
interface RecommendedProperty {
  id: number;
  title: string;
  location: string;
  price: number;
  image: string;
  rooms: number;
  baths: number;
  beds: number;
  gender: string;
  available_spots: number;
  bills_included: boolean;
  matching_percentage: number; // 0-100
  reason?: string; // From RAG service
  university_id?: number;
  accommodation_type?: string;
}
```

---

## 🎯 Key Features

### 1. Smart Question Grouping
- Questions are automatically grouped by category
- Groups appear as tabs/buttons for quick navigation
- Category indicators show which group user is in

### 2. Progress Tracking
- Visual progress bar shows completion percentage
- Displays current category name
- Shows number of required questions answered
- Category buttons allow jumping between groups

### 3. Step-by-Step Flow
- One group of questions per screen
- Previous/Next navigation buttons
- Validation ensures all required questions answered before moving forward
- Clear visual feedback on form state

### 4. Question Types Support
- **Text**: Free-form text input
- **Select**: Single choice radio buttons
- **Multi-Select**: Multiple checkboxes
- **Range**: Slider with min/max

### 5. Matching Percentage
- Displayed prominently on each property card (top-right)
- Green gradient badge with check icon
- Shows how well property matches user preferences

### 6. Save & Restart
- Save button stores recommendations to localStorage with:
  - Session ID
  - All properties
  - User answers
  - Timestamp
- New Search button resets form and starts fresh
- Users can answer questions again anytime

### 7. Property Navigation
- View button takes user to property detail page
- Properties remain accessible after search
- Can compare recommendations

---

## 🔌 API Endpoints

### 1. Get Questions
```http
GET /api/recommendations/questions
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "question": "What city are you looking in?",
      "question_type": "select",
      "options": ["Cairo", "Giza", "Alexandria"],
      "category": "Location",
      "is_required": true,
      "order": 1
    }
  ],
  "total": 15
}
```

### 2. Submit Answers & Get Recommendations
```http
POST /api/recommendations
Content-Type: application/json
Authorization: Bearer {token}

{
  "answers": {
    "1": { "value": "Cairo" },
    "2": { "value": 3000, "max": 5000 },
    "3": { "value": ["WiFi", "Gym"] }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Cozy Apartment",
      "location": "Downtown Cairo",
      "price": 3500,
      "image": "https://...",
      "rooms": 2,
      "baths": 1,
      "beds": 3,
      "gender": "Males",
      "available_spots": 2,
      "bills_included": true,
      "matching_percentage": 92,
      "reason": "Matches your budget and location preferences"
    }
  ],
  "session_id": "uuid-string",
  "message": "Recommendations generated successfully"
}
```

### 3. Get History (Optional)
```http
GET /api/recommendations/history
Authorization: Bearer {token}
```

---

## 🎨 UI/UX Features

### Dark Mode Support
- All components support dark mode
- Automatic light/dark theme switching
- Smooth color transitions

### Animations
- Fade-in animations on load
- Slide-in effects for questions
- Pulse animation on matching percentage badge
- Smooth transitions on hover

### Responsive Design
- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly buttons and inputs
- Collapsible sections on mobile

### Accessibility
- Clear labels for all inputs
- Required field indicators (*)
- Error messages for validation
- Keyboard navigation support
- ARIA attributes where needed

---

## 📊 Signals & Computed Properties

### Main Signals
- `isLoadingQuestions`: Loading state for questions
- `isSubmittingAnswers`: Submitting state for answers
- `showResults`: Toggle between questions/results view
- `allQuestions`: Array of all questions
- `questionGroups`: Grouped questions by category
- `categories`: Ordered list of categories
- `currentCategoryIndex`: Current group index
- `formAnswers`: User's answers object
- `recommendedProperties`: Array of recommended properties
- `sessionId`: Recommendation session ID
- `currentPage`: Pagination current page
- `rows`: Items per page

### Computed Properties
- `currentGroup`: Current question group
- `currentCategoryName`: Current category name
- `progressPercentage`: Progress bar percentage
- `totalQuestionsAnswered`: Count of answered questions
- `totalQuestionsRequired`: Count of required questions
- `isCurrentGroupAnswered`: Validation flag
- `paginatedProperties`: Paginated results
- `totalRecords`: Total recommended properties

---

## ✅ Validation & Error Handling

### Question Validation
- Required fields must be answered before proceeding
- Type-specific validation (text length, number ranges, etc.)
- Visual feedback on invalid inputs
- Toast notifications for errors

### API Error Handling
- Try-catch blocks on all HTTP calls
- User-friendly error messages
- Automatic retry logic (in service)
- Fallback UI for failures

### Form State Management
- Answers persist during navigation between groups
- Can go back and modify previous answers
- Reset on new search

---

## 📱 Local Storage

### Saved Data Structure
```json
{
  "sessionId": "uuid-string",
  "properties": [...],
  "answers": {...},
  "timestamp": "2025-12-11T10:30:00Z"
}
```

### Usage
- Users can recover saved recommendations
- Reference for future searches
- Track recommendation history

---

## 🚀 How to Use

### For Frontend Developers

1. **Import Component**
   ```typescript
   import { RecommendationComponent } from './features/recommendation/recommendation';
   ```

2. **Add to Routes**
   ```typescript
   { path: 'recommendations', component: RecommendationComponent }
   ```

3. **Navigate to Page**
   ```typescript
   this.router.navigate(['/recommendations']);
   ```

### For Backend Developers

1. Ensure `/api/recommendations/questions` returns formatted questions
2. Ensure `/api/recommendations` accepts answers and returns recommendations
3. Integrate with RAG service in controller
4. Return proper response format with `matching_percentage`

---

## 🔧 Configuration

### Environment Variables
```typescript
// environment.ts
export const environment = {
  apiUrl: 'http://localhost:8000/api'
};
```

### Customizable Values
- `rows`: Items per page (currently 6)
- `progressPercentage` calculation
- Animation durations
- Form validation rules

---

## 🎓 Question Example

Backend should structure questions like:

```php
RecommendationQuestion::create([
  'question' => 'What is your budget range?',
  'question_type' => 'range',
  'category' => 'Budget',
  'options' => [['min' => 1000, 'max' => 10000]],
  'is_required' => true,
  'order' => 5,
  'is_active' => true,
  'weight' => 2 // For RAG ranking
]);
```

---

## 📞 Support & Maintenance

### Common Issues

1. **Questions not loading**
   - Check API endpoint
   - Verify database has active questions
   - Check console for errors

2. **No recommendations returned**
   - Verify RAG service is running
   - Check database connection
   - Review answer formatting

3. **Styling issues**
   - Clear browser cache
   - Check dark mode settings
   - Verify Tailwind CSS is compiled

### Testing

- Test with various question types
- Test with different screen sizes
- Test dark mode
- Test error scenarios
- Test with no results

---

## 🎯 Future Enhancements

- Save draft answers
- Share recommendations
- Get explanations for matches
- Filter by price after recommendations
- Refine recommendations without starting over
- AI chat for questions clarification
- Property comparison tool
- Bookmark favorites from recommendations

