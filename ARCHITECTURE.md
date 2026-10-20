# 🏗️ Frontend Architecture Guide

## Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application (Port 3000)            │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
    ┌────────┐          ┌────────┐         ┌────────┐
    │ Router │          │ Context│         │  Pages │
    └────────┘          │ (Auth) │         └────────┘
        │               └────────┘              │
        │                   │                   │
        │                   ▼                   │
        │              ┌────────────┐          │
        └──────────────┤  useAuth   │◄─────────┘
                       │    Hook    │
                       └────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
    ┌────────┐         ┌────────┐         ┌────────┐
    │ Pages  │         │  Form  │         │ Admin  │
    │        │         │Validation        │Panel   │
    └────────┘         └────────┘         └────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
   ┌─────────┐         ┌─────────┐        ┌─────────┐
   │Components│         │Services │        │ Types   │
   │          │         │  Layer  │        │  (TS)   │
   └─────────┘         └─────────┘        └─────────┘
        │                   │
        │              ┌────┴─────┐
        │              │           │
        ▼              ▼           ▼
   ┌──────────┐  ┌──────────┐ ┌──────────┐
   │Tailwind  │  │ Axios    │ │ API      │
   │CSS       │  │ Instance │ │ Requests │
   └──────────┘  └──────────┘ └──────────┘
        │              │           │
        └──────────────┼───────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │  Backend API (Port 3001)     │
        │                              │
        │  - Authentication            │
        │  - Training CRUD             │
        │  - Request Management        │
        └──────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │      Database                │
        │                              │
        │  - Users                     │
        │  - Trainings                 │
        │  - Requests                  │
        └──────────────────────────────┘
```

---

## Data Flow Architecture

### Authentication Flow
```
┌─────────────┐
│   Login     │
│   Form      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│  Validate Form Input    │
│  (Client-side)          │
└──────┬──────────────────┘
       │ Valid
       ▼
┌─────────────────────────┐
│  POST /auth/login       │
│  (Axios Service)        │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  Backend Verification   │
│  (Backend)              │
└──────┬──────────────────┘
       │
       ├─ Valid ──────────┐
       │                  │
       │              ┌────────────┐
       │              │ Return JWT │
       │              └────┬───────┘
       │                   │
       ▼                   ▼
┌─────────────────────────────┐
│ Store Token in Context      │
│ Store Token in localStorage │
│ Set Authorization Header    │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Redirect to Home        │
│ Dashboard Available     │
└─────────────────────────┘
```

### Data Fetching Flow
```
┌──────────────────────┐
│  Page Component      │
│  (useEffect)         │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Service Method      │
│  (trainingService)   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Axios Instance      │
│  Add Auth Header     │
│  Make Request        │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────┐
│  API Response Received   │
└──────┬───────────────────┘
       │
       ├─ Success ────────┐
       │                  │
       │              ┌────────────┐
       │              │ Map Data   │
       │              │ Return     │
       │              └────┬───────┘
       │                   │
       └───────────┬───────┘
                   │
                   ▼
        ┌──────────────────┐
        │ Update State     │
        │ Re-render Page   │
        └──────────────────┘
```

---

## Component Hierarchy

```
┌─ App
   ├─ AuthProvider
   │  └─ ToastProvider
   │     └─ Router
   │        ├─ Navbar
   │        ├─ Main (Routes)
   │        │  ├─ HomePage
   │        │  │  ├─ Button
   │        │  │  ├─ Card
   │        │  │  └─ LoadingSpinner
   │        │  │
   │        │  ├─ TrainingListPage
   │        │  │  ├─ Input (Search)
   │        │  │  ├─ Card
   │        │  │  ├─ Button
   │        │  │  ├─ LoadingSpinner
   │        │  │  └─ EmptyState
   │        │  │
   │        │  ├─ RequestFormPage
   │        │  │  ├─ Card
   │        │  │  ├─ Input (Multiple)
   │        │  │  ├─ Select
   │        │  │  ├─ TextArea
   │        │  │  ├─ Button
   │        │  │  └─ Alert
   │        │  │
   │        │  ├─ AdminPage (Protected)
   │        │  │  ├─ Sidebar
   │        │  │  ├─ Dashboard Stats
   │        │  │  ├─ Table
   │        │  │  ├─ Modal
   │        │  │  ├─ AdminTrainingForm
   │        │  │  │  ├─ Input
   │        │  │  │  ├─ TextArea
   │        │  │  │  └─ Button
   │        │  │  └─ AdminRequestsList
   │        │  │     └─ Table
   │        │  │
   │        │  ├─ LoginPage
   │        │  │  ├─ Card
   │        │  │  ├─ Input (Multiple)
   │        │  │  └─ Button
   │        │  │
   │        │  ├─ RegisterPage
   │        │  │  ├─ Card
   │        │  │  ├─ Input (Multiple)
   │        │  │  └─ Button
   │        │  │
   │        │  ├─ CompanyProfilePage
   │        │  │  ├─ Card
   │        │  │  └─ Button
   │        │  │
   │        │  └─ KontakPage
   │        │     └─ Card
   │        │
   │        └─ Footer
   │
   └─ Toast Container (Portal)
      └─ Toast Items
```

---

## Service Layer Architecture

```
┌─────────────────────────────────────────┐
│         Services Layer                   │
└─────────────────────────────────────────┘
            │                │                │
            ▼                ▼                ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │ authService  │ │trainingService│ │requestService│
    └──────────────┘ └──────────────┘ └──────────────┘
            │                │                │
            │        ┌───────┴────────┐       │
            │        │                │       │
            ▼        ▼                ▼       ▼
      ┌──────────────────────────────────────────┐
      │         Axios Instance                   │
      │   (With Interceptors)                    │
      │   - Request: Add Auth Token              │
      │   - Response: Handle Errors              │
      └──────────────────────────────────────────┘
                        │
                        ▼
      ┌──────────────────────────────────────────┐
      │      Backend API                         │
      │      (Express/Node.js)                   │
      └──────────────────────────────────────────┘
```

---

## State Management Flow

```
┌─────────────────────────────────────┐
│      AuthContext Provider           │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  State Variables              │ │
│  ├───────────────────────────────┤ │
│  │  - user: User | null          │ │
│  │  - token: string | null       │ │
│  │  - isLoading: boolean         │ │
│  │  - isAuthenticated: boolean   │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Methods                      │ │
│  ├───────────────────────────────┤ │
│  │  - login()                    │ │
│  │  - register()                 │ │
│  │  - logout()                   │ │
│  │  - setUser()                  │ │
│  │  - setToken()                 │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│      useAuth() Hook                 │
│   (useContext Wrapper)              │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│      Components Using Auth          │
│                                     │
│  - Navbar                           │
│  - ProtectedRoute                   │
│  - LoginPage                        │
│  - RegisterPage                     │
│  - AdminPage                        │
└─────────────────────────────────────┘
```

---

## Routing Architecture

```
                    App
                     │
                Router (BrowserRouter)
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
      Routes       Routes        Routes
        │            │            │
   ┌────┴──┐     ┌────┴──┐    ┌──┴──┐
   │        │     │       │    │     │
   /        /form /admin  /login /register
   │        │     │       │     │
   ▼        ▼     ▼       ▼     ▼
Home   RequestForm Protected Auth
       Form       Route   Pages
                  ↓
                Admin
                Dashboard
```

---

## Component Communication Pattern

```
Parent Component (Page)
        │
        │ Props Down
        ▼
Child Component (Reusable)
        │
        │ Events Up
        ▼
Parent Callback
        │
        │ Update State
        ▼
Re-render Page
        │
        │ New Props
        ▼
Component Updates
```

### Example: Form Submission
```
RequestFormPage
    │
    ├─ Input → onChange
    ├─ Select → onChange
    ├─ TextArea → onChange
    │
    └─ Button → onClick
        │
        ▼
    handleSubmit()
        │
        ├─ Validate Form
        ├─ Call requestService.createRequest()
        │
        ▼
    Update State
        │
        ├─ setSubmitted(true)
        ├─ showNotification('success')
        └─ resetForm()
```

---

## Error Handling Architecture

```
API Request
    │
    ├─ Axios Request Interceptor
    │  └─ Attach Auth Token
    │
    ▼
Backend Processing
    │
    ├─ Success ─────┐
    │               │
    ▼               ▼
Response      Error Response
    │               │
    ├─ Response     ├─ 401 (Unauthorized)
    │  Interceptor  │  └─ Redirect to /login
    │               │     Clear localStorage
    │               │
    │               ├─ 403 (Forbidden)
    │               │  └─ Redirect to /
    │               │
    │               ├─ 400-500
    │               │  └─ Show Toast Error
    │               │
    │               └─ Network Error
    │                  └─ Show Error Message
    │
    ▼
Update Component State
    │
    ├─ setLoading(false)
    ├─ setData(response.data)
    ├─ setError(null)
    │
    └─ Render Success
```

---

## Performance Optimization

```
┌─────────────────────────────────────┐
│   Performance Optimization          │
├─────────────────────────────────────┤
│  • Code Splitting via React Router  │
│  • Component Memoization Ready      │
│  • Lazy Loading Ready               │
│  • Image Optimization Ready         │
│  • CSS Minification (Tailwind)      │
│  • Webpack Bundling (React Scripts) │
│  • HTTP Request Caching             │
│  • Token Persistence                │
│  • Service Worker Ready             │
│  • Production Build Optimization    │
└─────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────┐
│     Development Environment         │
│     (npm start on localhost:3000)   │
└─────────────────────────────────────┘
            │
            │ npm --prefix frontend run build
            │
            ▼
┌─────────────────────────────────────┐
│     Production Build                │
│  (Optimized in /frontend/build)     │
└─────────────────────────────────────┘
            │
            │ Deploy to Server
            │ (Netlify, Vercel, etc.)
            │
            ▼
┌─────────────────────────────────────┐
│     Production Environment          │
│     (Served to users)               │
└─────────────────────────────────────┘
            │
            │ API Calls to Backend
            │ (http://backend-domain/api)
            │
            ▼
┌─────────────────────────────────────┐
│     Backend API (Production)        │
│     (Node.js/Express server)        │
└─────────────────────────────────────┘
```

---

## Key Design Patterns Used

### 1. Context Pattern (Auth)
- Global state management
- Avoid prop drilling
- Centralized auth logic

### 2. Service Layer Pattern
- Separation of concerns
- Reusable API logic
- Easy to test and mock

### 3. Component Composition
- Reusable components
- Props-based customization
- Clear component boundaries

### 4. Hook Pattern
- Custom hooks (useAuth)
- State and logic reuse
- Cleaner component code

### 5. Protected Route Pattern
- Role-based access
- Conditional rendering
- Route guards

### 6. Error Boundary Ready
- Graceful error handling
- User-friendly messages
- Fallback UI

---

## Scalability Considerations

```
┌─────────────────────────────────────┐
│   Scalability Features              │
├─────────────────────────────────────┤
│  ✅ Modular Component Structure     │
│  ✅ Reusable Service Layer          │
│  ✅ Context for State Management    │
│  ✅ TypeScript for Type Safety      │
│  ✅ Proper Folder Organization      │
│  ✅ Clear Separation of Concerns    │
│  ✅ Easy to Add New Pages           │
│  ✅ Easy to Add New Components      │
│  ✅ Easy to Add New Services        │
│  ✅ Ready for Feature Modules       │
│  ✅ Ready for Code Splitting        │
│  ✅ Ready for Lazy Loading          │
└─────────────────────────────────────┘
```

---

## Future Enhancement Points

```
Potential Additions:
├─ Redux for Complex State
├─ React Query for Data Fetching
├─ Testing Suite (Jest, RTL)
├─ Storybook for Component Library
├─ Error Boundary Component
├─ Performance Monitoring
├─ Analytics Integration
├─ PWA Features
├─ Internationalization (i18n)
├─ Theme Switcher
├─ Real-time Updates (WebSocket)
└─ Advanced Caching Strategy
```

---

## Conclusion

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Scalable structure
- ✅ Type-safe codebase
- ✅ Reusable components
- ✅ Maintainable services
- ✅ Proper error handling
- ✅ Production-ready setup

**The application is built to grow with your needs!** 🚀
