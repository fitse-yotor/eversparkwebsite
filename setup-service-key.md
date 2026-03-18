# 🔑 Setup Service Role Key - Required Step

## You Need to Add Your Service Role Key

The service role key cannot be retrieved programmatically for security reasons. You must get it manually from Supabase Dashboard.

## Quick Steps (2 minutes)

### 1. Open Supabase Dashboard
Click this link: https://supabase.com/dashboard/project/dxuussllnpjssmtepuxp/settings/api

### 2. Find Service Role Key
- Scroll down to "Project API keys" section
- Look for the key labeled **"service_role"** (NOT "anon" or "publishable")
- Click the eye icon 👁️ to reveal the key
- Click the copy icon 📋 to copy it

### 3. Update .env.local
Open `.env.local` in your project and replace this line:
```env
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
```

With your actual key:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dXVzc2xsbnBqc3NtdGVwdXhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ1OTc1MywiZXhwIjoyMDg4MDM1NzUzfQ.YOUR_ACTUAL_KEY_HERE
```

### 4. Restart Your Server
```bash
# Stop the server (Ctrl+C)
npm run dev
```

### 5. Test It
Go to: http://localhost:3000/hr/onboarding
- The warning should be gone
- The "Create HR User" button should be active
- You can now create HR users!

## ⚠️ Security Note

The service role key has full admin access to your database:
- ✅ Safe in `.env.local` (not committed to git)
- ❌ Never commit it to version control
- ❌ Never expose it in client-side code

Your `.gitignore` already protects `.env.local`.

## Need Help?

See `GET_SERVICE_ROLE_KEY.md` for detailed screenshots and instructions.
