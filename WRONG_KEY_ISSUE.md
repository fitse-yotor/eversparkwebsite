# ⚠️ Wrong Key Type - Need Service Role Key

## Issue Found

You added a **publishable key** instead of a **service role key**.

**What you have**:
```env
SUPABASE_SERVICE_ROLE_KEY=sb_publishable_LUVF28_YvrIr3ap_ge6i0g_zGTNWVHH
```
This is a **publishable key** (starts with `sb_publishable_`)

**What you need**:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
This is a **service role key** (starts with `eyJ` and is MUCH longer)

---

## Why This Matters

| Key Type | Starts With | Length | Purpose |
|----------|-------------|--------|---------|
| Publishable | `sb_publishable_` | ~50 chars | Client-side, limited access |
| Service Role | `eyJ` | ~200+ chars | Server-side, full admin access |

The service role key is needed to create users and bypass RLS policies.

---

## How to Get the Correct Key

### Step 1: Open Supabase Settings
Go to: https://supabase.com/dashboard/project/dxuussllnpjssmtepuxp/settings/api

### Step 2: Find the Right Key
Scroll down to **"Project API keys"** section.

You'll see multiple keys:
- ❌ **anon** (public) - starts with `eyJ...` but says "anon"
- ❌ **publishable** - starts with `sb_publishable_`
- ✅ **service_role** - starts with `eyJ...` and says "service_role" ← THIS ONE!

### Step 3: Copy the Service Role Key
1. Find the row labeled **"service_role"**
2. Click the eye icon 👁️ to reveal it
3. Click the copy icon 📋 to copy the ENTIRE key
4. It should be very long (200+ characters)

### Step 4: Update .env.local
Replace the current line with the correct key:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dXVzc2xsbnBqc3NtdGVwdXhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ1OTc1MywiZXhwIjoyMDg4MDM1NzUzfQ.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Make sure to copy the ENTIRE key - it's very long!

### Step 5: Restart Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## Visual Guide

When you're on the API settings page, look for this:

```
Project API keys
┌─────────────────────────────────────────────────────────┐
│ Name: anon                                              │
│ Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...          │ ← NOT this one
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Name: service_role                                      │
│ Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...          │ ← THIS ONE!
└─────────────────────────────────────────────────────────┘
```

---

## Quick Check

After updating, your `.env.local` should look like:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dxuussllnpjssmtepuxp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dXVzc2xsbnBqc3NtdGVwdXhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTk3NTMsImV4cCI6MjA4ODAzNTc1M30.XgoLoQopW6z8wSDUckoRk_AiDqchrPF_2utgBHySiBA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dXVzc2xsbnBqc3NtdGVwdXhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ1OTc1MywiZXhwIjoyMDg4MDM1NzUzfQ.XXXXXXXXX
```

Notice:
- ✅ All three keys start with `eyJ`
- ✅ Service role key is very long
- ✅ Service role key has `"role":"service_role"` in it (you can decode it at jwt.io to verify)

---

## How to Verify It's Correct

### Method 1: Check the Length
- ❌ Publishable key: ~50 characters
- ✅ Service role key: ~200+ characters

### Method 2: Check the Start
- ❌ Publishable key: starts with `sb_publishable_`
- ✅ Service role key: starts with `eyJ`

### Method 3: Decode It (Optional)
Go to https://jwt.io and paste your key. It should show:
```json
{
  "role": "service_role"  ← Should say "service_role" not "anon"
}
```

---

## After Fixing

1. Update `.env.local` with the correct service role key
2. Restart your server
3. Go to http://localhost:3000/hr/onboarding
4. The warning should disappear
5. "Create HR User" button should be active

---

## Need Help?

The service role key is in the same place as the anon key, just a different row. Look for the one labeled **"service_role"** specifically.

If you're still having trouble, take a screenshot of the API settings page (blur the keys) and I can help identify which one to copy.
