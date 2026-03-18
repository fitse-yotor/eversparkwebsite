# Role-Based Access Control (RBAC) Implementation

## Overview
The system now has comprehensive role-based access control to ensure users can only access features appropriate to their role.

## User Roles

### 1. Employee (`employee`)
**Access:**
- `/employee/*` - Employee portal
- `/employee/dashboard` - Employee dashboard
- `/employee/leave/request` - Leave request form
- Employee-specific features

**Restrictions:**
- ❌ Cannot access HR pages
- ❌ Cannot access Admin pages
- ❌ Cannot manage other employees

### 2. HR Admin (`admin`)
**Access:**
- `/hr/*` - All HR management pages
- `/hr/dashboard` - HR dashboard
- `/hr/employees` - Employee management
- `/hr/departments` - Department management
- `/hr/leaves` - Leave management
- `/hr/onboarding` - HR user onboarding
- `/admin/*` - Admin pages

**Restrictions:**
- ❌ Cannot access employee-only pages
- ⚠️ Limited admin permissions (not super admin)

### 3. Super Admin (`super_admin`)
**Access:**
- ✅ Full system access
- All HR pages
- All Admin pages
- All Employee pages (for testing/support)
- System settings
- User management

**No Restrictions**

### 4. Regular User (`user`)
**Access:**
- Public pages only
- `/` - Home
- `/about` - About page
- `/contact` - Contact page
- `/products` - Products
- `/projects` - Projects
- `/blogs` - Blog posts

**Restrictions:**
- ❌ No access to HR, Admin, or Employee portals

## Implementation

### Middleware Protection
File: `middleware.ts`

The middleware automatically:
1. Checks if user is authenticated
2. Retrieves user's role from database
3. Validates access to requested route
4. Redirects unauthorized users to `/unauthorized`

### Route Protection Rules

```typescript
/hr/*        → Requires: admin OR super_admin
/employee/*  → Requires: employee
/admin/*     → Requires: admin OR super_admin
/auth/*      → Public (login/signup)
/*           → Public pages
```

### Helper Functions
File: `lib/auth.ts`

```typescript
getCurrentUser()      // Get current authenticated user
hasRole(user, roles)  // Check if user has specific role
isAdmin(user)         // Check if user is admin/super_admin
isEmployee(user)      // Check if user is employee
isSuperAdmin(user)    // Check if user is super_admin
```

File: `lib/role-redirect.ts`

```typescript
getDashboardUrl(role)     // Get appropriate dashboard URL
canAccessHR(role)         // Check HR access permission
canAccessEmployee(role)   // Check employee access permission
canAccessAdmin(role)      // Check admin access permission
```

## User Flow

### Employee Login
1. Employee logs in
2. Middleware checks role = `employee`
3. Redirected to `/employee/dashboard`
4. Can access employee features only

### HR Admin Login
1. HR admin logs in
2. Middleware checks role = `admin`
3. Redirected to `/hr/dashboard`
4. Can access HR and admin features

### Unauthorized Access Attempt
1. User tries to access restricted page
2. Middleware checks role
3. Role doesn't match requirements
4. Redirected to `/unauthorized` page
5. Shows helpful message with role information

## Database Schema

### profiles table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('user', 'employee', 'admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Security Features

### 1. Server-Side Validation
- All role checks happen on the server
- Cannot be bypassed by client-side manipulation
- Middleware runs before page loads

### 2. Database-Level Security
- Row Level Security (RLS) policies
- Role-based data access
- Audit trails

### 3. Session Management
- Secure cookie-based sessions
- Automatic session refresh
- Session expiration handling

## Testing Role-Based Access

### Test as Employee
1. Create employee user with role = `employee`
2. Login and verify redirect to `/employee/dashboard`
3. Try accessing `/hr/dashboard` → Should redirect to `/unauthorized`

### Test as HR Admin
1. Create HR user with role = `admin`
2. Login and verify redirect to `/hr/dashboard`
3. Try accessing `/employee/dashboard` → Should redirect to `/unauthorized`
4. Access `/hr/employees` → Should work

### Test as Super Admin
1. Login with super_admin role
2. Should access all pages without restrictions

## Error Handling

### Unauthorized Access
- User sees friendly error page
- Clear explanation of access levels
- Options to go back or go home
- No technical error details exposed

### Session Expiration
- Automatic redirect to login
- Preserves intended destination
- Returns to original page after login

## Configuration

### Environment Variables
No additional configuration needed. Uses existing:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Middleware Config
```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
```

## Customization

### Adding New Roles
1. Update `UserRole` type in `lib/auth.ts`
2. Add role to database CHECK constraint
3. Update middleware route protection
4. Create role-specific dashboard

### Adding Protected Routes
1. Add route pattern to middleware
2. Specify required roles
3. Create unauthorized redirect

### Custom Permissions
Use helper functions to check specific permissions:

```typescript
import { getCurrentUser, hasRole } from '@/lib/auth'

const user = await getCurrentUser()
if (hasRole(user, ['admin', 'super_admin'])) {
  // Show admin features
}
```

## Best Practices

### 1. Always Check on Server
```typescript
// ✅ Good - Server-side check
export async function GET() {
  const user = await getCurrentUser()
  if (!isAdmin(user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  // ... proceed
}

// ❌ Bad - Client-side only
if (userRole === 'admin') {
  // This can be bypassed
}
```

### 2. Use Middleware for Pages
- Let middleware handle page-level protection
- Focus API routes on data-level protection

### 3. Provide Clear Feedback
- Show appropriate error messages
- Guide users to correct pages
- Don't expose system internals

## Troubleshooting

### User Can't Access Expected Pages
1. Check user's role in database
2. Verify middleware is running
3. Check browser console for errors
4. Clear cookies and re-login

### Middleware Not Working
1. Verify `middleware.ts` is in root directory
2. Check matcher configuration
3. Restart development server
4. Check Supabase connection

### Role Not Updating
1. User needs to logout and login again
2. Check database for correct role
3. Verify profile trigger is working

## Status: ✅ COMPLETE

Role-based access control is fully implemented and working!

- ✅ Middleware protection
- ✅ Role validation
- ✅ Unauthorized page
- ✅ Helper functions
- ✅ Employee dashboard
- ✅ HR dashboard
- ✅ Admin dashboard
- ✅ Automatic redirects
