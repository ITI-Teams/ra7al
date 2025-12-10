# Quick Test Guide - Recommendation System

## 🚀 Start Services

Open 3 terminals and run:

**Terminal 1 - Backend:**
```bash
cd backend
php artisan serve
```

**Terminal 2 - Frontend:**
```bash
cd frontend
ng serve -o
```

**Terminal 3 - RAG Service:**
```bash
cd rag-service
node src/server.js
```

---

## ✅ Manual Testing Steps

### Step 1: Check if Questions Load
```bash
# In a terminal, test the public endpoint
curl -s http://localhost:8000/api/recommendations/questions | jq '.total'
```
Expected output: `28`

### Step 2: Login as Student
1. Go to http://localhost:4200
2. Click Login
3. Use: `email: student@test.com` | `password: password`
4. Select role: `student`
5. Click Login

### Step 3: Navigate to Recommendations
1. After login, go to `/recommendations` in URL or click menu
2. You should see "Find Your Perfect Accommodation"

### Step 4: Answer Questions
- **Budget:** Drag slider to select monthly rent (1000-10000)
- **Location:** Select "Cairo" 
- **Commute:** Select "Less than 5 km"
- **Roommates:** Select "1-2 roommates"
- **Furnished:** Select preference
- **Smoking:** Select yes/no
- Continue through all question groups

### Step 5: Get Recommendations
- After answering all required questions
- Click **"Get Recommendations"** button
- Wait for processing (shows "Generating...")
- Properties should appear in grid format

### Step 6: Verify Results
Check for:
- ✅ Property cards display with images
- ✅ Matching percentage shown (top right badge)
- ✅ Available spots displayed
- ✅ Bills included info shown
- ✅ Can scroll through results with pagination

---

## 🔍 Backend Debugging

### Check if Questions Exist
```bash
cd backend
php artisan tinker
>>> \App\Models\RecommendationQuestion::count()
28  # Should see this
>>> \App\Models\RecommendationQuestion::first()
# Should show question data
```

### Check Laravel Logs
```bash
tail -f backend/storage/logs/laravel.log
```

### Test API Directly with Token
```bash
# 1. Login to get token
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"password","role":"student"}' \
  | jq -r '.data.token')

# 2. Test recommendations endpoint
curl -X POST http://localhost:8000/api/recommendations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "1": {"value": 3000},
      "2": {"value": "Cairo"}
    }
  }' | jq '.'
```

---

## ⚠️ Common Issues & Fixes

### Issue: 403 Forbidden Error
```
Status: 403 Forbidden
Message: Unauthenticated
```
**Fix:**
1. Make sure you're logged in
2. Check `localStorage.getItem('api_token')` in console
3. Verify interceptor is active

### Issue: 500 Server Error
```
Error: RAG service is currently unavailable
```
**Fix:**
1. Check if RAG service is running
2. Check rag-service logs for errors
3. Verify database connection in `.env`

### Issue: No Properties Returned
```
Response: { success: true, data: [], ... }
```
**Fix:**
1. Make sure properties exist in database
2. Check RAG service is connected to database
3. Verify database has properties matching criteria

### Issue: CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Fix:**
1. Check `backend/config/cors.php`
2. Ensure `http://localhost:4200` is in `allowed_origins`
3. Ensure `supports_credentials` is `true`

---

## 📊 Expected Behavior

### Questions Phase
- [ ] 14 questions displayed in 7 groups (by category)
- [ ] Progress bar updates as you answer
- [ ] Required questions marked with red asterisk
- [ ] Can't proceed to next group without answering required Qs
- [ ] Category tabs at top for quick navigation

### Results Phase
- [ ] Properties displayed in grid (1 col mobile, 2 col tablet, 3 col desktop)
- [ ] Each property shows:
  - Image with hover effect
  - Matching percentage (top right)
  - Available spots (top left)
  - Bills included badge
  - Title, location, price, rooms, baths
  - Quick view button
- [ ] Can save results locally
- [ ] Can start new search

---

## 🧪 Unit Testing Commands

```bash
# Run Laravel tests
cd backend
php artisan test tests/Feature/RecommendationTest.php

# Run frontend tests  
cd frontend
ng test
```

---

## 📈 Performance Tips

- Questions cached after first load (check Network tab)
- Properties pagination: 6 per page by default
- Results stored in session for history
- RAG service has 30 second timeout

---

## 🎯 Success Criteria

When everything works, you should see:
1. ✅ 28 questions load from API
2. ✅ Login/logout works
3. ✅ Can submit answers without 403 error
4. ✅ Recommendations return in < 30 seconds
5. ✅ Properties display with proper formatting
6. ✅ Matching percentages show between 60-100%

