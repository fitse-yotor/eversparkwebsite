# Complete Deployment Guide

## 🚀 Quick Fix for Current Build Issue

### Issues Identified
1. ✅ **Next.js 15.2.6 security vulnerability** - Updated to 15.3.0
2. ✅ **Deprecated package** - Removed `@supabase/auth-helpers-nextjs`
3. ⚠️ **TypeScript errors ignored** - `ignoreBuildErrors: true` in config

### Immediate Actions Required

```bash
# 1. Update dependencies
npm install

# 2. Run build locally to check for errors
npm run build

# 3. If build succeeds, commit and push
git add .
git commit -m "fix: update dependencies and fix build issues"
git push origin main
```

## 📋 Pre-Deployment Checklist

### 1. Environment Variables

Ensure these are set in Vercel:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Email (Required for employee onboarding)
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Application (Required)
NEXT_PUBLIC_SITE_URL=https://yourdomain.vercel.app
```

### 2. Database Setup

Ensure all migration scripts have been run:

```sql
-- Run in Supabase SQL Editor in this order:
1. scripts/002-create-content-tables.sql
2. scripts/007-seed-product-data.sql
3. scripts/008-create-messages-table.sql
4. scripts/012-create-blogs-table.sql
5. scripts/013-create-projects-table.sql
6. scripts/019-create-hr-tables.sql
```

### 3. Create Admin User

```bash
# Run locally or in Vercel Functions
node scripts/create-admin-user.js
```

Or manually in Supabase SQL Editor:

```sql
-- Create admin user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@yourdomain.com',
  crypt('your-secure-password', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);

-- Create profile with admin role
INSERT INTO profiles (id, email, role, full_name)
SELECT id, email, 'admin', 'Admin User'
FROM auth.users
WHERE email = 'admin@yourdomain.com';
```

## 🔧 Configuration Options

### Option 1: Keep Current Config (Development)

Keep `next.config.mjs` as is for development:
- Ignores TypeScript errors
- Unoptimized images
- Faster builds

### Option 2: Production Config (Recommended)

Replace `next.config.mjs` with `next.config.production.mjs`:

```bash
# Backup current config
mv next.config.mjs next.config.dev.mjs

# Use production config
mv next.config.production.mjs next.config.mjs

# Commit changes
git add .
git commit -m "chore: use production config"
git push
```

Benefits:
- Better performance
- Security headers
- Optimized images
- Console log removal in production

## 🐛 Troubleshooting Build Errors

### Error: "Module not found"

**Check imports:**
```bash
# Search for problematic imports
grep -r "from '@supabase/auth-helpers-nextjs'" .
```

**Fix:** Update to use `@supabase/ssr` instead

### Error: "Type error" during build

**Option 1: Fix TypeScript errors (Recommended)**
```bash
# Check for errors
npx tsc --noEmit

# Fix errors in reported files
```

**Option 2: Temporarily ignore (Not recommended for production)**
```javascript
// In next.config.mjs
typescript: {
  ignoreBuildErrors: true,
}
```

### Error: "Cannot find module"

**Solution:**
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Error: Database connection failed

**Check:**
1. Environment variables are set correctly
2. Supabase project is active
3. Database migrations are run
4. RLS policies are enabled

## 📊 Vercel Deployment Steps

### Step 1: Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Select the repository

### Step 2: Configure Project

**Framework Preset:** Next.js

**Build Command:** `npm run build` (default)

**Output Directory:** `.next` (default)

**Install Command:** `npm install` (default)

### Step 3: Add Environment Variables

Click "Environment Variables" and add all required variables from the checklist above.

**Important:** 
- Add variables for all environments (Production, Preview, Development)
- Use `NEXT_PUBLIC_` prefix for client-side variables
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret (server-side only)

### Step 4: Deploy

Click "Deploy" and wait for the build to complete.

## 🔍 Monitoring Deployment

### Check Build Logs

```
Vercel Dashboard → Your Project → Deployments → Latest → Build Logs
```

Look for:
- ✅ "Build completed successfully"
- ❌ Any error messages
- ⚠️ Warnings about deprecated packages

### Check Function Logs

```
Vercel Dashboard → Your Project → Deployments → Latest → Functions
```

Monitor:
- API route executions
- Server action calls
- Error logs

### Check Runtime Logs

```
Vercel Dashboard → Your Project → Logs
```

Filter by:
- Errors
- Warnings
- Specific routes

## 🧪 Post-Deployment Testing

### 1. Test Public Pages

- [ ] Homepage loads: `https://yourdomain.com`
- [ ] About page: `https://yourdomain.com/about`
- [ ] Products page: `https://yourdomain.com/products`
- [ ] Contact page: `https://yourdomain.com/contact`

### 2. Test Authentication

- [ ] Login page loads: `https://yourdomain.com/login`
- [ ] Can login with admin credentials
- [ ] Redirects to correct dashboard based on role
- [ ] Logout works correctly

### 3. Test HR Module

- [ ] HR dashboard loads: `https://yourdomain.com/hr/dashboard`
- [ ] Employee list loads: `https://yourdomain.com/hr/employees`
- [ ] Can add new employee
- [ ] Employee receives credentials email
- [ ] Leave management works

### 4. Test Admin Module

- [ ] Admin dashboard loads: `https://yourdomain.com/admin/dashboard`
- [ ] Content management works: `https://yourdomain.com/admin/content`
- [ ] Product management works: `https://yourdomain.com/admin/products`
- [ ] Messages load: `https://yourdomain.com/admin/messages`

### 5. Test Employee Portal

- [ ] Employee can login
- [ ] Dashboard loads: `https://yourdomain.com/employee/dashboard`
- [ ] Can request leave: `https://yourdomain.com/employee/leave/request`
- [ ] Can view profile

### 6. Test Email Functionality

- [ ] Employee onboarding sends email
- [ ] Resend credentials works
- [ ] Leave approval sends email
- [ ] Contact form sends email

## 🔒 Security Checklist

- [ ] All environment variables are set
- [ ] Service role key is not exposed to client
- [ ] RLS policies are enabled on all tables
- [ ] HTTPS is enforced
- [ ] Security headers are configured
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented (if needed)
- [ ] Input validation is in place
- [ ] SQL injection prevention is active
- [ ] XSS protection is enabled

## 🚨 Common Issues & Solutions

### Issue: "Internal Server Error" on API routes

**Solution:**
1. Check Vercel function logs
2. Verify environment variables
3. Check database connection
4. Review API route code for errors

### Issue: Images not loading

**Solution:**
1. Check image domains in `next.config.mjs`
2. Verify Supabase storage is accessible
3. Check image URLs are correct
4. Enable `unoptimized: true` if needed

### Issue: Slow page loads

**Solution:**
1. Enable caching with `revalidate`
2. Use static generation where possible
3. Optimize images
4. Check database query performance
5. Enable Vercel Analytics to identify bottlenecks

### Issue: Database queries failing

**Solution:**
1. Check RLS policies
2. Verify service role key is correct
3. Check if tables exist
4. Review query syntax
5. Check Supabase logs

## 📈 Performance Optimization

### Enable ISR (Incremental Static Regeneration)

```typescript
// In page.tsx
export const revalidate = 3600 // Revalidate every hour

export default async function Page() {
  // Your page code
}
```

### Use Static Generation

```typescript
// For static pages
export const dynamic = 'force-static'
```

### Optimize Database Queries

```typescript
// Use select to limit fields
const { data } = await supabase
  .from('employees')
  .select('id, first_name, last_name, email')
  .limit(10)
```

### Enable Caching

```typescript
// In API routes
export const revalidate = 60 // Cache for 60 seconds

export async function GET() {
  // Your API logic
}
```

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to:
- `main` branch → Production
- Other branches → Preview deployments

### Manual Deployments

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## 📞 Support Resources

- **Vercel Status**: https://www.vercel-status.com/
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Support**: https://vercel.com/support

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ Build completes without errors
- ✅ All pages load correctly
- ✅ Authentication works
- ✅ Database queries succeed
- ✅ Emails are sent successfully
- ✅ All modules are accessible
- ✅ No console errors in browser
- ✅ Performance is acceptable
- ✅ Security headers are present
- ✅ Mobile responsive

---

**Need Help?** Check the build logs first, then review this guide. Most issues are related to environment variables or database setup.

**Last Updated**: March 18, 2026
