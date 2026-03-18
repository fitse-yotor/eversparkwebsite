# 🚀 Configure Service Role Key Now

## ⚠️ Action Required

Your HR onboarding system is ready but needs the service role key to function.

---

## 📋 Quick 2-Minute Setup

### Step 1: Get the Key
👉 Click here: https://supabase.com/dashboard/project/dxuussllnpjssmtepuxp/settings/api

Look for **"service_role"** key and copy it.

### Step 2: Add to .env.local
Open `.env.local` and replace:
```env
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
```

With:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your_actual_key
```

### Step 3: Restart
```bash
npm run dev
```

### Step 4: Test
Go to: http://localhost:3000/hr/onboarding

---

## ✅ What's Changed

- ❌ Removed manual onboarding option
- ✅ Single automated solution only
- ✅ Clear error messages
- ✅ Button disabled until configured
- ✅ Direct link to Supabase settings

---

## 📚 Full Instructions

See **SETUP_HR_ONBOARDING.md** for detailed guide with troubleshooting.

---

## 🎯 Bottom Line

1. Get service role key from Supabase
2. Add to `.env.local`
3. Restart server
4. Done! ✨

The "Create HR User" button will become active and you can start onboarding HR users!
