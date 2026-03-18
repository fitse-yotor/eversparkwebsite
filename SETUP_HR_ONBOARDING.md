# 🔑 HR User Onboarding Setup

## Current Status

The HR user onboarding feature requires the Supabase service role key to be configured.

**What you'll see without the key:**
- ⚠️ Red warning banner on `/hr/onboarding`
- ❌ "Create HR User" button is disabled
- ❌ Cannot create HR users

**What you'll see with the key:**
- ✅ No warning banner
- ✅ "Create HR User" button is active
- ✅ Can create HR users with automatic invitation emails

---

## Setup Instructions (2 minutes)

### Step 1: Get Your Service Role Key

1. Open this link: https://supabase.com/dashboard/project/dxuussllnpjssmtepuxp/settings/api

2. Scroll to the **"Project API keys"** section

3. Find the key labeled **"service_role"** (NOT "anon" or "publishable")

4. Click the eye icon 👁️ to reveal the key

5. Click the copy icon 📋 to copy the entire key

   The key will look like:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dXVzc2xsbnBqc3NtdGVwdXhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ1OTc1MywiZXhwIjoyMDg4MDM1NzUzfQ.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

### Step 2: Update .env.local

1. Open the `.env.local` file in your project root

2. Find this line:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
   ```

3. Replace `YOUR_SERVICE_ROLE_KEY_HERE` with your actual key:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dXVzc2xsbnBqc3NtdGVwdXhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ1OTc1MywiZXhwIjoyMDg4MDM1NzUzfQ.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

4. Save the file

### Step 3: Restart Development Server

Stop your current server (press `Ctrl+C`) and restart it:

```bash
npm run dev
```

### Step 4: Test It

1. Go to: http://localhost:3000/hr/onboarding

2. You should see:
   - ✅ No red warning banner
   - ✅ "Create HR User" button is enabled
   - ✅ Form is ready to use

3. Try creating a test HR user:
   - Fill in the form
   - Click "Create HR User"
   - User should be created successfully
   - Invitation email will be sent automatically

---

## Security Notes

### ⚠️ Important

The service role key has **full admin access** to your Supabase database. Keep it secure:

- ✅ **Safe**: Storing in `.env.local` (not committed to git)
- ✅ **Safe**: Using in server-side API routes only
- ❌ **Unsafe**: Committing to version control
- ❌ **Unsafe**: Exposing in client-side code
- ❌ **Unsafe**: Sharing publicly

Your `.gitignore` already excludes `.env.local`, so you're protected from accidental commits.

---

## Troubleshooting

### "Create HR User" button is still disabled

**Solution**: 
1. Make sure you saved `.env.local`
2. Make sure you restarted the server
3. Hard refresh the page (Ctrl+Shift+R)

### "Invalid service role key" error

**Solution**:
1. Make sure you copied the entire key (it's very long)
2. Make sure you copied the "service_role" key, not "anon"
3. Make sure there are no extra spaces before or after the key

### Can't find the service role key

**Solution**:
1. Make sure you're logged into Supabase Dashboard
2. Make sure you're viewing the correct project (dxuussllnpjssmtepuxp)
3. Go to Settings → API → Project API keys section

### Warning banner still shows after setup

**Solution**:
1. Clear your browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check browser console for errors

---

## What This Enables

Once configured, you can:

- ✅ Create HR Admin users
- ✅ Create Super Admin users
- ✅ Send automatic invitation emails
- ✅ Set user roles and permissions
- ✅ Manage HR user access

All from the `/hr/onboarding` page!

---

## Need More Help?

See also:
- **GET_SERVICE_ROLE_KEY.md** - Visual guide with screenshots
- **FINAL_HR_STATUS.md** - Complete HR system overview

---

## Quick Reference

**Supabase API Settings**: https://supabase.com/dashboard/project/dxuussllnpjssmtepuxp/settings/api

**HR Onboarding Page**: http://localhost:3000/hr/onboarding

**What to copy**: The "service_role" key (very long, starts with `eyJ`)

**Where to paste**: `.env.local` file, replace `YOUR_SERVICE_ROLE_KEY_HERE`

**Don't forget**: Restart server after updating `.env.local`

---

That's it! Once configured, HR user creation will work seamlessly. 🎉
