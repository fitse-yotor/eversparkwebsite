# HR User Onboarding - Setup Guide

## Issue Fixed
The HR user creation was not working because it wasn't properly creating Supabase Auth users.

## Solution
Updated the API to use Supabase Admin API with service role key to:
1. Create actual Supabase Auth users
2. Create profile entries
3. Create admin_users entries
4. Send invitation emails

---

## Required Environment Variables

You need to add the **Service Role Key** to your `.env.local` file:

### Step 1: Get Your Service Role Key

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Find the **service_role** key (under "Project API keys")
5. Copy the key (it starts with `eyJ...`)

⚠️ **IMPORTANT**: The service role key has admin privileges. Never expose it in client-side code!

### Step 2: Add to `.env.local`

Add this line to your `.env.local` file:

```env
# Supabase Service Role Key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Your complete `.env.local` should look like:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional: Site URL for email redirects
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 3: Restart Development Server

After adding the environment variable:

```bash
# Stop the server (Ctrl+C)
# Then restart it
npm run dev
```

---

## How It Works Now

### 1. Create Auth User
```typescript
const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
  email: email,
  email_confirm: !send_invitation,
  user_metadata: {
    first_name: first_name,
    last_name: last_name,
    role: role
  }
})
```

### 2. Create Profile
```typescript
await supabaseAdmin.from("profiles").insert({
  id: userId, // Same as auth user ID
  email: email,
  full_name: `${first_name} ${last_name}`,
  role: role
})
```

### 3. Create Admin User Entry
```typescript
await supabaseAdmin.from("admin_users").insert({
  user_id: userId,
  permissions: {
    can_manage_users: role === "super_admin",
    can_manage_content: true,
    can_manage_settings: role === "super_admin"
  },
  is_active: true
})
```

### 4. Send Invitation Email (Optional)
```typescript
await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
  redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
})
```

---

## Testing the Fix

### Test 1: Create HR Admin User

1. Navigate to `/hr/onboarding`
2. Fill in the form:
   ```
   First Name: Sarah
   Last Name: Johnson
   Email: sarah.johnson@company.com
   Role: HR Admin
   Send Invitation Email: ✓
   ```
3. Click "Create HR User"
4. You should see: "HR user created successfully. Invitation email sent to sarah.johnson@company.com"

### Test 2: Verify User Creation

Check in Supabase Dashboard:

1. Go to **Authentication** → **Users**
2. You should see the new user with email `sarah.johnson@company.com`
3. Go to **Table Editor** → **profiles**
4. You should see a profile entry with role `admin`
5. Go to **Table Editor** → **admin_users**
6. You should see an admin_users entry linked to the profile

### Test 3: User Login

1. The user receives an invitation email
2. They click the link to set their password
3. After setting password, they can login at `/admin`
4. They should have access to HR features

---

## Troubleshooting

### Error: "Missing SUPABASE_SERVICE_ROLE_KEY"

**Solution**: Add the service role key to `.env.local` and restart the server.

### Error: "User with this email already exists"

**Solution**: The user already exists in Supabase Auth. Either:
- Use a different email
- Delete the existing user from Supabase Dashboard → Authentication → Users

### Error: "Failed to create profile"

**Possible causes**:
1. RLS policies blocking insert
2. Foreign key constraint (profiles.id must match auth.users.id)

**Solution**: Check RLS policies on profiles table:
```sql
-- Allow service role to insert profiles
CREATE POLICY "Service role can insert profiles" ON profiles
  FOR INSERT
  TO service_role
  USING (true);
```

### Error: "Failed to send invitation email"

**Possible causes**:
1. Email service not configured in Supabase
2. Invalid redirect URL

**Solution**: 
- User is still created successfully
- Manually send password reset link from Supabase Dashboard
- Or configure email templates in Supabase Dashboard → Authentication → Email Templates

---

## Alternative: Manual User Creation

If you don't want to use the service role key, you can create users manually:

### Option 1: Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click "Invite user"
3. Enter email
4. User receives invitation email
5. After they set password, manually add entries to `profiles` and `admin_users` tables

### Option 2: SQL Script

```sql
-- 1. Create user in Supabase Dashboard first
-- 2. Then run this SQL (replace USER_ID and EMAIL)

-- Create profile
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  'USER_ID_FROM_AUTH',
  'user@company.com',
  'First Last',
  'admin'
);

-- Create admin user
INSERT INTO admin_users (user_id, permissions, is_active)
VALUES (
  'USER_ID_FROM_AUTH',
  '{"can_manage_users": false, "can_manage_content": true, "can_manage_settings": false}'::jsonb,
  true
);
```

---

## Security Best Practices

1. ✅ **Never expose service role key in client-side code**
2. ✅ **Only use service role key in API routes (server-side)**
3. ✅ **Store service role key in environment variables**
4. ✅ **Add `.env.local` to `.gitignore`**
5. ✅ **Use different keys for development and production**
6. ✅ **Rotate keys periodically**

---

## Email Configuration (Optional)

To enable invitation emails, configure SMTP in Supabase:

1. Go to **Settings** → **Authentication**
2. Scroll to **SMTP Settings**
3. Enable custom SMTP
4. Add your SMTP credentials:
   - Host: smtp.gmail.com (or your provider)
   - Port: 587
   - Username: your-email@gmail.com
   - Password: your-app-password
5. Save settings

Or use Supabase's default email service (limited in free tier).

---

## Summary

The HR onboarding system now:
- ✅ Creates real Supabase Auth users
- ✅ Creates profile entries automatically
- ✅ Creates admin_users entries automatically
- ✅ Sends invitation emails (if configured)
- ✅ Handles errors with proper rollback
- ✅ Validates input data
- ✅ Checks for duplicate users

Just add the `SUPABASE_SERVICE_ROLE_KEY` to your `.env.local` and restart the server!
