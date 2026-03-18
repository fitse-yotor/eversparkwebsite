# How to Get Your Supabase Service Role Key

## Visual Step-by-Step Guide

### Step 1: Go to Supabase Dashboard
```
🌐 Open: https://supabase.com/dashboard
```

### Step 2: Select Your Project
```
Click on your project from the list
```

### Step 3: Navigate to API Settings
```
Left Sidebar → Settings (⚙️) → API
```

### Step 4: Find Service Role Key
```
Scroll down to "Project API keys" section

You'll see three keys:
┌─────────────────────────────────────────┐
│ Project API keys                        │
├─────────────────────────────────────────┤
│ anon public                             │
│ eyJhbGc... (public key)                 │
│ [Copy]                                  │
├─────────────────────────────────────────┤
│ service_role secret                     │
│ eyJhbGc... (service role key) ← THIS ONE│
│ [Copy] [Reveal]                         │
└─────────────────────────────────────────┘
```

### Step 5: Copy the Service Role Key
```
1. Click [Reveal] if the key is hidden
2. Click [Copy] to copy the key
3. It should start with: eyJ...
```

### Step 6: Add to .env.local
```
Open your .env.local file and add:

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                          ↑
                          Paste the key here
```

### Step 7: Restart Server
```bash
# In your terminal:
# 1. Stop the server (Ctrl+C or Cmd+C)
# 2. Start it again:
npm run dev
```

---

## Complete .env.local Example

Your `.env.local` file should look like this:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjE2MTYxNiwiZXhwIjoxOTMxNzM3NjE2fQ.abcdefghijklmnopqrstuvwxyz
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MTYxNjE2LCJleHAiOjE5MzE3Mzc2MTZ9.abcdefghijklmnopqrstuvwxyz

# Optional
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Verification

After adding the key and restarting:

### Test 1: Check Environment Variable
```bash
# In your terminal (while server is running):
echo $SUPABASE_SERVICE_ROLE_KEY

# Should output: eyJ... (your key)
```

### Test 2: Try Creating HR User
```
1. Go to http://localhost:3000/hr/onboarding
2. Fill in the form
3. Click "Create HR User"
4. Should see: "HR user created successfully"
```

### Test 3: Check Supabase Dashboard
```
1. Go to Authentication → Users
2. New user should appear in the list
```

---

## Troubleshooting

### ❌ Error: "Missing SUPABASE_SERVICE_ROLE_KEY"
**Cause**: Environment variable not loaded

**Fix**:
1. Make sure you added it to `.env.local` (not `.env`)
2. Restart the development server
3. Check for typos in the variable name

### ❌ Error: "Invalid JWT"
**Cause**: Wrong key or corrupted key

**Fix**:
1. Copy the key again from Supabase Dashboard
2. Make sure you copied the entire key (it's very long)
3. No extra spaces before or after the key

### ❌ Error: "Unauthorized"
**Cause**: Using anon key instead of service role key

**Fix**:
1. Make sure you copied the **service_role** key, not the **anon** key
2. The service_role key should have "service_role" in its decoded payload

---

## Security Checklist

✅ Added to `.env.local` (not `.env`)
✅ `.env.local` is in `.gitignore`
✅ Never committed to git
✅ Never exposed in client-side code
✅ Only used in API routes (server-side)

---

## Quick Reference

| What | Where |
|------|-------|
| Dashboard | https://supabase.com/dashboard |
| Location | Settings → API → Project API keys |
| Key Type | service_role secret |
| Starts With | eyJ... |
| File | .env.local |
| Variable Name | SUPABASE_SERVICE_ROLE_KEY |

---

## Done!

Once you've added the key and restarted the server, HR user creation will work automatically. No code changes needed!

Try it now:
1. Go to `/hr/onboarding`
2. Create a test user
3. Check if it works! 🎉
