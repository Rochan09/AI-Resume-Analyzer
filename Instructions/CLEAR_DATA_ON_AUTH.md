# Clear Resume Data on Authentication

## Overview
Implemented automatic clearing of sample/existing resume data when users register or log in to ensure a fresh start for each authenticated user.

## Changes Made

### 1. AuthContext Updates (`frontend/src/contexts/AuthContext.tsx`)

#### Login Function
```typescript
const login = async (email: string, password: string) => {
  // ... authentication logic ...
  
  // Clear existing resume data from localStorage
  localStorage.removeItem('resumeData');
  localStorage.removeItem('interviewPrepQuestions');
  
  // Dispatch custom event to notify other components
  window.dispatchEvent(new Event('resumeDataCleared'));
  
  // ... set auth state ...
};
```

#### Register Function
```typescript
const register = async (email: string, password: string, fullName: string) => {
  // ... registration logic ...
  
  // Clear existing resume data from localStorage
  localStorage.removeItem('resumeData');
  localStorage.removeItem('interviewPrepQuestions');
  
  // Dispatch custom event to notify other components
  window.dispatchEvent(new Event('resumeDataCleared'));
  
  // ... set auth state ...
};
```

#### Logout Function
```typescript
const logout = () => {
  setToken(null);
  setUser(null);
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
  localStorage.removeItem('resumeData');
  localStorage.removeItem('interviewPrepQuestions');
  
  // Dispatch custom event to notify other components
  window.dispatchEvent(new Event('resumeDataCleared'));
  
  window.location.hash = 'login';
};
```

### 2. ResumeContext Updates (`frontend/src/contexts/ResumeContext.tsx`)

#### Event Listener for Data Clearing
```typescript
useEffect(() => {
  const handleResumeDataCleared = () => {
    setResumeData(defaultResumeData);
  };

  window.addEventListener('resumeDataCleared', handleResumeDataCleared);
  return () => window.removeEventListener('resumeDataCleared', handleResumeDataCleared);
}, []);
```

#### Updated Reset Function
```typescript
const resetResumeData = () => {
  setResumeData(defaultResumeData);
  localStorage.removeItem('resumeData');
};
```

## How It Works

### When User Registers
1. User fills in registration form (name, email, password)
2. Backend creates account and returns JWT token
3. **Frontend clears all resume data from localStorage**
4. **Custom event 'resumeDataCleared' is dispatched**
5. ResumeContext listens for the event and resets to empty state
6. User sees completely empty resume builder with no sample data

### When User Logs In
1. User enters credentials
2. Backend validates and returns JWT token
3. **Frontend clears all resume data from localStorage**
4. **Custom event 'resumeDataCleared' is dispatched**
5. ResumeContext resets to empty state
6. User starts with a clean slate

### When User Logs Out
1. User clicks logout button
2. **Frontend clears auth tokens AND resume data**
3. **Custom event 'resumeDataCleared' is dispatched**
4. All data is removed from localStorage
5. User is redirected to login page

## Data That Gets Cleared

### localStorage Items Removed
- `resumeData` - All resume information (personal info, education, experience, skills, projects)
- `interviewPrepQuestions` - Generated interview questions from uploaded resumes
- `authToken` (on logout) - JWT authentication token
- `authUser` (on logout) - User information

### Resume Data Reset to Empty State
```typescript
{
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
  },
  summary: '',
  education: [],
  experience: [],
  skills: [],
  projects: [],
}
```

## Benefits

1. **Clean User Experience**
   - New users don't see confusing sample data like "Allu Arjun (Stylish Star)"
   - Each user starts with a blank canvas

2. **Data Privacy**
   - Previous user's data is completely cleared on logout
   - No data leakage between user sessions

3. **Consistent State**
   - Resume data is always in sync with authentication state
   - No stale data from previous sessions

4. **Proper User Separation**
   - Prepares the system for future user-specific resume storage in MongoDB
   - Each user will have their own resumes associated with their account

## Future Enhancements

Once user-resume associations are implemented in the backend:
1. On login, fetch user's saved resumes from MongoDB
2. On logout, save current resume to MongoDB (if user wants)
3. Allow users to have multiple resumes
4. Sync resume data between devices

## Testing

### Test Scenario 1: New Registration
1. Go to registration page
2. Create an account
3. ✅ Verify Builder page shows empty fields
4. ✅ Verify no sample data appears in Live Preview

### Test Scenario 2: Login After Data Entry
1. Log out if logged in
2. Enter sample data in Builder (without logging in)
3. Log in with your account
4. ✅ Verify all previous sample data is cleared
5. ✅ Verify Builder shows empty state

### Test Scenario 3: Logout
1. Enter some resume data while logged in
2. Click logout
3. ✅ Verify redirected to login page
4. ✅ Log in again - should see empty state

## Implementation Status

- ✅ Clear data on login
- ✅ Clear data on register
- ✅ Clear data on logout
- ✅ ResumeContext listens for clear events
- ✅ Custom event system for cross-component communication
- ✅ No compilation errors
- ✅ Ready for testing

## Technical Notes

### Why Custom Events?
We use `window.dispatchEvent(new Event('resumeDataCleared'))` instead of just relying on localStorage changes because:
1. Storage events don't fire in the same tab/window that made the change
2. Custom events provide immediate, synchronous notification
3. Better control over when and how data is cleared
4. More explicit and maintainable code

### Event-Driven Architecture
This pattern allows loose coupling between AuthContext and ResumeContext:
- AuthContext doesn't need to know about ResumeContext
- Easy to add more listeners in the future
- Clean separation of concerns
