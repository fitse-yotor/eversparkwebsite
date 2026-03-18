# 🔑 Key Comparison - Which One to Use?

## Current Issue

You added the wrong type of key. Here's the difference:

---

## ❌ What You Have (Wrong)

**Publishable Key**:
```env
SUPABASE_SERVICE_ROLE_KEY=sb_publishable_LUVF28_YvrIr3ap_ge6i0g_zGTNWVHH
```

**Characteristics**:
- Starts with: `sb_publishable_`
- Length: ~50 characters
- Purpose: Client-side operations
- Permissions: Limited, public-safe
- Label in Dashboard: "publishable" or "default"

---

## ✅ What You Need (Correct)

**Service Role Key**:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dXVzc2xsbnBqc3NtdGVwdXhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ1OTc1MywiZXhwIjoyMDg4MDM1NzUzfQ.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Characteristics**:
- Starts with: `eyJ`
- Length: ~200+ characters (MUCH longer)
- Purpose: Server-side admin operations
- Permissions: Full database access
- Label in Dashboard: **"service_role"** ← Look for this exact label!

---

## Side-by-Side Comparison

| Feature | Publishable Key | Service Role Key |
|---------|----------------|------------------|
| **Starts with** | `sb_publishable_` | `eyJ` |
| **Length** | ~50 chars | ~200+ chars |
| **Format** | Custom string | JWT token |
| **Use case** | Client apps | Server admin |
| **Can create users** | ❌ No | ✅ Yes |
| **Bypass RLS** | ❌ No | ✅ Yes |
| **What you need** | ❌ Wrong | ✅ Correct |

---

## Where to Find It

Go to: https://supabase.com/dashboard/project/dxuussllnpjssmtepuxp/settings/api

Look for the **"Project API keys"** section. You'll see a table like this:

```
┌──────────────────┬─────────────────────────────────────────┐
│ Name             │ Key                                     │
├──────────────────┼─────────────────────────────────────────┤
│ anon             │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │ ← NOT this
│ (public)         │ [👁️] [📋]                              │
├──────────────────┼─────────────────────────────────────────┤
│ service_role     │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │ ← THIS ONE!
│ (secret)         │ [👁️] [📋]                              │
└──────────────────┴─────────────────────────────────────────┘
```

**Important**: 
- Look for the row labeled **"service_role"**
- It will say "(secret)" underneath
- Click the eye icon 👁️ to reveal it
- Click the copy icon 📋 to copy it

---

## Quick Test

After you copy the key, check:

1. **Does it start with `eyJ`?**
   - ✅ Yes → Correct!
   - ❌ No → Wrong key

2. **Is it very long (200+ characters)?**
   - ✅ Yes → Correct!
   - ❌ No → Wrong key

3. **Does it have dots (.) in it?**
   - ✅ Yes (format: `eyJ...xxx.yyy.zzz`) → Correct!
   - ❌ No → Wrong key

---

## Example of Correct Format

Your service role key should look like this structure:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.
eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dXVzc2xsbnBqc3NtdGVwdXhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ1OTc1MywiZXhwIjoyMDg4MDM1NzUzfQ
.
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Three parts separated by dots (`.`), all on one line, no spaces.

---

## After You Get the Correct Key

1. **Update .env.local**:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dXVzc2xsbnBqc3NtdGVwdXhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ1OTc1MywiZXhwIjoyMDg4MDM1NzUzfQ.XXXXXXXXXX
   ```

2. **Save the file**

3. **Restart server**:
   ```bash
   npm run dev
   ```

4. **Test**:
   - Go to http://localhost:3000/hr/onboarding
   - Warning should be gone
   - Button should be active

---

## Still Not Sure?

If you're looking at the Supabase dashboard and see multiple keys, here's how to identify them:

**Anon Key** (NOT what you need):
- Label: "anon" or "anon (public)"
- Starts with: `eyJ`
- Has `"role":"anon"` when decoded

**Service Role Key** (WHAT YOU NEED):
- Label: **"service_role"** or "service_role (secret)"
- Starts with: `eyJ`
- Has `"role":"service_role"` when decoded
- Usually marked as "secret" or has a warning icon

**Publishable Key** (NOT what you need):
- Label: "publishable" or "default"
- Starts with: `sb_publishable_`
- Shorter than JWT keys

---

## Summary

**Current**: You have a publishable key (`sb_publishable_...`)
**Need**: Service role key (`eyJ...` with "service_role" label)
**Where**: Same settings page, different row
**Look for**: The row labeled **"service_role"** specifically

Copy that one, and you're all set! 🎯
