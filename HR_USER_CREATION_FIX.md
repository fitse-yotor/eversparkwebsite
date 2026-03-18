# HR User Creation - Fix Summary

## Problem
The HR user creation feature was not working because it wasn't properly creating Supabase Auth users.

## Solution
Updated the API route to use Supabase Admin API with proper authentication.

---

## Quick Fix (2 Steps)

### Step 1: Add Service Role Key

Add this to your `.env.local` file:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Where to find it:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **service_role** key (starts with `eyJ...`)

### Step 2: Restart Server

```bash
# Stop the server (Ctrl+C)
npm run dev
```

That's it! HR user creation will now work.

---

## How to Test

1. Go to `/hr/onboarding`
2. Fill in:
   - First Name: Test
   - Last Name: User
   - Email: test@company.com
   - Role: HR Admin
   - Send Invitation: ✓
3. Click "Create HR User"
4. Should see success message
5. Check Supabase Dashboard → Authentication → Users
6. New user should appear

---

## What Happens Now

When you create an HR user:

1. ✅ **Creates Supabase Auth user** (can login)
2. ✅ **Creates profile entry** (with role)
3. ✅ **Creates admin_users entry** (with permissions)
4. ✅ **Sends invitation email** (user sets password)

---

## Alternative: Manual Creation

If you don't want to add the service role key right now, you can create HR users manually:

### Method 1: Supabase Dashboard

1. Go to **Authentication** → **Users** → **Invite user**
2. Enter email and send invitation
3. After user sets password, run this SQL:

```sql
-- Replace USER_ID with the actual user ID from auth.users
-- Replace EMAIL and NAME with actual values

-- Create profile
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  'USER_ID_HERE',
  'user@company.com',
  'First Last',
  'admin'
);

-- Create admin user
INSERT INTO admin_users (user_id, permissions, is_active)
VALUES (
  'USER_ID_HERE',
  '{"can_manage_users": false, "can_manage_content": true, "can_manage_settings": false}'::jsonb,
  true
);
```

### Method 2: Use Existing Admin

If you already have an admin user (like abdisa@eversparktech.com), you can:
1. Login with that account
2. Use the HR features
3. Create employees
4. Manage departments

---

## Files Changed

1. **`app/api/hr/onboard/route.ts`** - Updated to use Supabase Admin API
2. **`HR_ONBOARDING_SETUP.md`** - Detailed setup guide
3. **`HR_USER_CREATION_FIX.md`** - This quick reference

---

## Security Note

⚠️ The service role key has admin privileges:
- ✅ Only use in API routes (server-side)
- ✅ Never expose in client-side code
- ✅ Keep in `.env.local` (not committed to git)
- ✅ Use different keys for dev/production

---

## Need Help?

See the detailed guide: `HR_ONBOARDING_SETUP.md`

Or just add the service role key and restart - it should work immediately!
