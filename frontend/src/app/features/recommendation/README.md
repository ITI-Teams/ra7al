# 🎯 Recommendation Feature - Quick Start Guide

## 📁 File Structure

```
frontend/src/app/
├── features/recommendation/
│   ├── recommendation.ts          # Main component
│   ├── recommendation.html        # Template
│   ├── recommendation.css         # Styles
│   ├── recommendation.spec.ts     # Component tests
├── core/services/recommendation/
│   ├── recommendation.service.ts         # Service
│   └── recommendation.service.spec.ts    # Service tests
```

## 🚀 Quick Setup

### 1. Backend API Verification
Ensure these endpoints are working:

```bash
# Get questions (no auth required)
GET /api/recommendations/questions

# Submit answers (requires auth)
POST /api/recommendations
Authorization: Bearer {token}
Content-Type: application/json
```

### 2. Frontend Navigation
Add link to navbar or navigation menu:

```html
<a routerLink="/recommendations">Get Recommendations</a>
```

### 3. Test the Feature
```bash
# Start frontend
cd frontend
ng serve -o

# Navigate to http://localhost:4200/recommendations
```

## 💡 How It Works

### User Journey

1. **Visit Recommendations Page** → `/recommendations`
2. **Answer Questions** → Questions organized in groups/categories
3. **Submit Answers** → Backend processes with RAG service
4. **View Results** → Matching properties displayed with scores
5. **Save or Search Again** → Options to save or restart

### Data Flow

```
User Answers
    ↓
[Frontend Component]
    ↓
POST /api/recommendations
    ↓
[Backend Controller]
    ↓
[RAG Service (Node.js)]
    ↓
Query Database + OpenAI Processing
    ↓
Return Ranked Properties with Scores
    ↓
[Frontend Display Results]
```

## 🎨 UI Components

### Questions Phase
- **Progress Bar**: Visual progress tracking
- **Category Tabs**: Quick navigation between question groups
- **Form Inputs**: Text, select, multi-select, range questions
- **Navigation Buttons**: Previous/Next/Submit

### Results Phase
- **Property Cards**: Grid layout with images
- **Matching Score**: Green badge showing percentage
- **Quick Actions**: View details, save, search again
- **Pagination**: Browse through results

## ⚙️ Configuration

### Enable Feature in Routes
Already added to `app.routes.ts`:
```typescript
{ path: 'recommendations', component: RecommendationComponent }
```

### API Configuration
Uses environment configuration:
```typescript
// environment.ts
apiUrl: 'http://localhost:8000/api'
```

## 🔍 Testing

### Run Unit Tests
```bash
# Component tests
ng test --include='**/recommendation.spec.ts'

# Service tests
ng test --include='**/recommendation.service.spec.ts'
```

### Manual Testing Checklist
- [ ] Questions load correctly
- [ ] All question types work (text, select, multi, range)
- [ ] Navigation between groups works
- [ ] Required fields validation works
- [ ] Answers submit successfully
- [ ] Results display with correct percentages
- [ ] Pagination works
- [ ] Save/Restart buttons work
- [ ] Dark mode works
- [ ] Mobile responsive

## 📊 Customization

### Change Items Per Page
In `recommendation.ts`:
```typescript
rows = signal(6); // Change to desired number
```

### Modify Progress Percentage
The progress bar calculates automatically based on total groups.

### Add Custom Styling
Edit `recommendation.css` or add Tailwind classes in template.

## 🐛 Troubleshooting

### Questions Not Loading
```
Check:
1. Network tab - verify /api/recommendations/questions returns 200
2. Console - look for CORS errors
3. Backend - ensure questions exist in database
4. Backend - verify RecommendationController::getQuestions
```

### No Recommendations Returned
```
Check:
1. RAG service is running (Node.js service)
2. Database credentials in .env
3. Post request body format
4. Backend logs for errors
5. OpenAI API key in .env
```

### Styling Issues
```
Check:
1. Tailwind CSS compiled
2. Browser cache cleared
3. Dark mode setting correct
4. CSS specificity conflicts
```

### Form Validation Not Working
```
Check:
1. is_required field in questions is_true
2. Question type is supported
3. Answer format matches question type
```

## 📚 API Reference

### Questions Response Format
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "question": "Question text",
      "question_type": "select|text|multi_select|range",
      "options": ["option1", "option2"],
      "category": "Category Name",
      "is_required": true,
      "order": 1
    }
  ],
  "total": 10
}
```

### Recommendations Response Format
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Property Name",
      "matching_percentage": 92,
      "reason": "Why it matches",
      "...other fields..."
    }
  ],
  "session_id": "uuid",
  "message": "Success message"
}
```

## 🔐 Authentication

- Questions: No authentication required
- Recommendations: Requires `Authorization: Bearer {token}`
- Service automatically includes auth headers

## 💾 Local Storage

Recommendations saved with:
```typescript
{
  "sessionId": "uuid",
  "properties": [...],
  "answers": {...},
  "timestamp": "ISO string"
}
```

Access via: `localStorage.getItem('savedRecommendations')`

## 🎯 Feature Highlights

✅ Smart question grouping by category  
✅ Step-by-step user experience  
✅ Real-time progress tracking  
✅ Multiple question types supported  
✅ Matching percentage display  
✅ Dark mode support  
✅ Responsive design  
✅ Error handling & validation  
✅ Save recommendations  
✅ Restart search anytime  
✅ Property detail navigation  
✅ Full test coverage  

## 📞 Need Help?

1. Check the full guide: `RECOMMENDATION_PAGE_GUIDE.md`
2. Review test files for usage examples
3. Check console for error messages
4. Verify API endpoints are working
5. Check backend logs for processing errors

## 🚀 Next Steps

1. ✅ Frontend component created
2. ✅ Service implemented
3. ✅ Routes configured
4. ⏭️ **Backend integration** - Ensure RAG service returns data
5. ⏭️ Test with real data
6. ⏭️ Deploy to production

---

**Status**: Ready for testing with backend integration
**Last Updated**: December 11, 2025
