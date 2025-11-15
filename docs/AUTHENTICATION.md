# Authentication System Documentation

## Overview

The Recipe Health App uses **NextAuth.js v5** (Auth.js) for authentication, integrated with our MongoDB Repository Pattern.

## Features

- **Email/Password Authentication** - Traditional credentials-based login
- **Google OAuth** - Social login with Google
- **Protected Routes** - Middleware-based route protection
- **Session Management** - JWT-based sessions with automatic refresh
- **Onboarding Flow** - Multi-step wizard for new users
- **Profile Management** - Complete user profile and settings management

## Architecture

```
lib/
├── auth.ts                    # NextAuth configuration
├── hooks/
│   └── useUser.ts            # Client-side user hook
db/
├── models/index.ts           # User model with auth fields
├── schemas/user.schema.ts    # MongoDB User schema
└── repositories/user.repository.ts  # User data access

app/
├── providers.tsx             # SessionProvider wrapper
├── auth/
│   ├── signin/              # Sign in page
│   ├── signup/              # Sign up page
│   └── onboarding/          # Onboarding wizard
├── (dashboard)/
│   ├── layout.tsx           # Protected dashboard layout
│   ├── profile/             # Profile management
│   └── settings/            # Settings page
└── api/
    └── auth/
        ├── [...nextauth]/   # NextAuth API route
        └── signup/          # User registration endpoint

middleware.ts                 # Route protection middleware
```

## Authentication Flow

### 1. Sign Up Flow

```
User fills signup form
    ↓
POST /api/auth/signup (creates user with hashed password)
    ↓
Auto sign-in with credentials
    ↓
Redirect to /auth/onboarding
    ↓
User completes onboarding (3 steps)
    ↓
Redirect to dashboard
```

### 2. Sign In Flow (Credentials)

```
User enters email/password
    ↓
POST /api/auth/callback/credentials
    ↓
Verify password with bcrypt
    ↓
Generate JWT session token
    ↓
Redirect to dashboard or callbackUrl
```

### 3. Sign In Flow (Google OAuth)

```
User clicks "Continue with Google"
    ↓
Redirect to Google consent screen
    ↓
Google callback with authorization code
    ↓
Create/update user in MongoDB
    ↓
Generate JWT session token
    ↓
Redirect to /auth/onboarding (if new) or dashboard
```

## Configuration

### Environment Variables

```bash
# MongoDB
MONGODB_URI=mongodb+srv://...

# NextAuth
AUTH_SECRET=your-secret-here  # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://yourdomain.com/api/auth/callback/google` (prod)
6. Copy Client ID and Secret to `.env.local`

## User Model

The User model includes comprehensive fields:

```typescript
interface User {
  // Basic
  email: string
  name: string
  password?: string  // Only for credentials users
  image?: string     // OAuth profile image
  provider?: 'credentials' | 'google' | 'github'

  // Profile
  profile?: {
    age?: number
    gender?: string
    height?: number
    weight?: number
    activityLevel?: string
    allergies?: string[]
    avatar?: string
  }

  // Goals
  goals?: {
    goalType?: string
    targetWeight?: number
    targetDate?: Date
    dailyCalorieTarget?: number
  }

  // Preferences
  preferences?: {
    dietType?: string
    dislikedIngredients?: string[]
    preferredCuisines?: string[]
  }

  // Settings
  settings?: {
    units?: 'metric' | 'imperial'
    language?: string
    notifications?: {
      email?: boolean
      mealReminders?: boolean
      expirationAlerts?: boolean
    }
  }

  onboardingCompleted?: boolean
}
```

## Protected Routes

Routes are protected using middleware in `middleware.ts`:

### Public Routes (No Auth Required)
- `/auth/signin`
- `/auth/signup`
- `/auth/error`

### Protected Routes (Auth Required)
- `/profile`
- `/settings`
- `/auth/onboarding`
- All `/api/users/*` endpoints
- All `/api/fridge-items/*` endpoints

### Middleware Logic

1. **Check authentication** - Verify JWT token
2. **Redirect logic:**
   - Authenticated users trying to access auth pages → Redirect to `/`
   - Unauthenticated users trying to access protected pages → Redirect to `/auth/signin`
3. **Onboarding check** - Users who haven't completed onboarding → Redirect to `/auth/onboarding`

## Client-Side Usage

### Using the useUser Hook

```typescript
import { useUser } from "@/lib/hooks/useUser"

function MyComponent() {
  const { user, isLoading, isAuthenticated, updateSession } = useUser()

  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please sign in</div>

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Email: {user.email}</p>
    </div>
  )
}
```

### Manual Session Update

After updating user data, refresh the session:

```typescript
const { updateSession } = useUser()

// Update user in database
await fetch(`/api/users/${user.id}`, {
  method: 'PATCH',
  body: JSON.stringify(updates)
})

// Refresh session
await updateSession()
```

## Server-Side Usage

### In Server Components

```typescript
import { auth } from "@/lib/auth"

export default async function Page() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  return <div>Hello {session.user.name}</div>
}
```

### In API Routes

```typescript
import { auth } from "@/lib/auth"

export async function GET(request: Request) {
  const session = await auth()

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Use session.user.id to fetch user data
  const user = await db.users.findById(session.user.id)

  return Response.json(user)
}
```

## Onboarding System

The onboarding wizard collects:

### Step 1: Profile Information
- Age, gender
- Height, weight
- Activity level

### Step 2: Health Goals
- Goal type (lose/gain/maintain/build muscle)
- Target weight
- Daily calorie target

### Step 3: Preferences
- Diet type
- Allergies
- Disliked ingredients

After completion, `onboardingCompleted` is set to `true`, allowing access to the main app.

## Security Features

1. **Password Hashing** - bcrypt with 12 salt rounds
2. **JWT Sessions** - Secure, stateless sessions
3. **CSRF Protection** - Built-in NextAuth CSRF protection
4. **Secure Cookies** - HTTP-only, secure cookies in production
5. **Password Validation** - Minimum 8 characters required
6. **Email Validation** - Server-side email format checking

## Testing Authentication

### Manual Testing

1. **Sign Up:**
   ```bash
   # Navigate to http://localhost:3000/auth/signup
   # Fill form and submit
   ```

2. **Sign In:**
   ```bash
   # Navigate to http://localhost:3000/auth/signin
   # Use credentials or Google OAuth
   ```

3. **Test Protected Routes:**
   ```bash
   # Try accessing /profile without auth → Should redirect to signin
   # Sign in → Should redirect to onboarding (first time)
   # Complete onboarding → Should access /profile
   ```

### API Testing

```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Get user profile (requires authentication cookie)
curl http://localhost:3000/api/users/[id] \
  -H "Cookie: authjs.session-token=..."
```

## Troubleshooting

### Common Issues

1. **"Invalid credentials" error**
   - Check password is correct
   - Verify user exists in database
   - Check password field is included in query (use `.select('+password')`)

2. **Infinite redirect loop**
   - Clear cookies
   - Check middleware matcher pattern
   - Verify AUTH_SECRET is set

3. **Google OAuth not working**
   - Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
   - Check authorized redirect URIs in Google Console
   - Ensure callback URL matches exactly

4. **Session not persisting**
   - Check AUTH_SECRET is set and consistent
   - Verify cookies are enabled in browser
   - Check NEXTAUTH_URL matches your domain

## Best Practices

1. **Always use the useUser hook** on client components
2. **Use `auth()` function** for server components and API routes
3. **Never expose password** in API responses
4. **Update session** after profile changes
5. **Handle loading states** properly
6. **Redirect after auth actions** for better UX
7. **Use environment variables** for all secrets

## Next Steps

- [ ] Add email verification
- [ ] Implement password reset flow
- [ ] Add 2FA support
- [ ] Social login with more providers (GitHub, Facebook)
- [ ] Session activity logging
- [ ] Account deletion feature
