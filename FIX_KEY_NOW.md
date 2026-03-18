# ⚡ Fix the Key - Quick Checklist

## Problem
You added a **publishable key** instead of a **service role key**.

---

## ✅ Quick Fix (2 minutes)

### 1. Open Supabase Settings
👉 https://supabase.com/dashboard/project/dxuussllnpjssmtepuxp/settings/api

### 2. Find "service_role" Row
Look for the table with API keys. Find the row that says **"service_role"** (NOT "anon", NOT "publishable")

### 3. Copy the Correct Key
- Click the eye icon 👁️ to reveal
- Click the copy icon 📋 to copy
- The key should be VERY LONG (200+ characters)
- Should start with `eyJ`

### 4. Update .env.local
Replace this line:
```env
SUPABASE_SERVICE_ROLE_KEY=sb_publishable_LUVF28_YvrIr3ap_ge6i0g_zGTNWVHH
```

With the correct key:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dXVzc2xsbnBqc3NtdGVwdXhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ1OTc1MywiZXhwIjoyMDg4MDM1NzUzfQ.PASTE_YOUR_ACTUAL_KEY_HERE
```

### 5. Restart Server
```bash
npm run dev
```

### 6. Test
Go to: http://localhost:3000/hr/onboarding
- ✅ No warning banner
- ✅ Button is active

---

## How to Know You Got the Right Key

✅ **Correct key**:
- Starts with `eyJ`
- Very long (200+ characters)
- Has dots (.) in it
- From the row labeled "service_role"

❌ **Wrong key**:
- Starts with `sb_publishable_`
- Short (~50 characters)
- From the row labeled "publishable" or "default"

---

## Need More Help?

See these guides:
- **KEY_COMPARISON.md** - Visual comparison of keys
- **WRONG_KEY_ISSUE.md** - Detailed explanation
- **SETUP_HR_ONBOARDING.md** - Full setup guide

---

## Direct Link

👉 https://supabase.com/dashboard/project/dxuussllnpjssmtepuxp/settings/api

Look for **"service_role"** row, copy that key!
