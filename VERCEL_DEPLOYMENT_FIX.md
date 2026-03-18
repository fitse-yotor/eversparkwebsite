# Vercel Deployment Fix Guide

## Issues Fixed

### 1. ✅ Next.js Security Vulnerability
- **Issue**: Next.js 15.2.6 has a security vulnerability
- **Fix**: Updated to Next.js 15.3.0 (latest patched version)
- **Reference**: https://nextjs.org/blog/security-update-2025-12-11

### 2. ✅ Deprecated Package Removed
- **Issue**: `@supabase/auth-helpers-nextjs@0.15.0` is deprecated
- **Fix**: Removed from dependencies (not being used in codebase)
- **Alternative**: Using `@supabase/ssr` which is the recommended package

## Steps to Deploy

### 1. Update Dependencies Locally

```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Install updated dependencies
npm install

# Test the build locally
npm run build

# Test the application
npm run dev
```

### 2. Commit and Push Changes

```bash
git add package.json package-lock.json
git commit -m "fix: update Next.js to 15.3.0 and remove deprecated packages"
git push origin main
```

### 3. Vercel Will Auto-Deploy

Vercel will automatically detect the push and start a new deployment with the fixed dependencies.

## Environment Variables Required

Make sure these environment variables are set in your Vercel project settings:

### Required Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on "Settings"
3. Click on "Environment Variables"
4. Add each variable with its value
5. Select the environment (Production, Preview, Development)
6. Click "Save"

## Common Deployment Issues

### Issue: Build Fails with "Module not found"

**Solution**: Make sure all imports are correct and packages are installed
```bash
npm install
npm run build
```

### Issue: Environment Variables Not Working

**Solution**: 
1. Check variable names match exactly (case-sensitive)
2. Redeploy after adding variables
3. Use `NEXT_PUBLIC_` prefix for client-side variables

### Issue: Database Connection Fails

**Solution**:
1. Verify Supabase URL and keys are correct
2. Check if Supabase project is active
3. Verify RLS policies are set up correctly

### Issue: Email Not Sending

**Solution**:
1. Verify Resend API key is valid
2. Check if sender email is verified in Resend
3. Check Resend dashboard for delivery logs

## Build Optimization

### Reduce Build Time

Add to `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize builds
  swcMinify: true,
  
  // Reduce bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Image optimization
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
```

### Ignore Build Errors (Use with Caution)

If you need to deploy despite TypeScript errors (not recommended for production):

```javascript
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}
```

## Monitoring Deployment

### Check Build Logs

1. Go to Vercel dashboard
2. Click on your project
3. Click on "Deployments"
4. Click on the latest deployment
5. View "Build Logs" tab

### Check Function Logs

1. Go to deployment details
2. Click on "Functions" tab
3. View real-time logs

### Check Analytics

1. Go to project dashboard
2. Click on "Analytics"
3. Monitor performance and errors

## Post-Deployment Checklist

- [ ] Verify homepage loads correctly
- [ ] Test login functionality
- [ ] Test HR module access
- [ ] Test Admin module access
- [ ] Test Employee portal access
- [ ] Verify email sending works
- [ ] Check database connections
- [ ] Test file uploads
- [ ] Verify all routes are accessible
- [ ] Check mobile responsiveness
- [ ] Test form submissions
- [ ] Verify leave request workflow
- [ ] Test employee onboarding

## Rollback Strategy

If deployment fails or has issues:

### Option 1: Rollback in Vercel Dashboard
1. Go to "Deployments"
2. Find the last working deployment
3. Click "..." menu
4. Click "Promote to Production"

### Option 2: Revert Git Commit
```bash
git revert HEAD
git push origin main
```

### Option 3: Redeploy Previous Commit
```bash
git reset --hard <previous-commit-hash>
git push --force origin main
```

## Performance Optimization

### Enable Caching

Add to your API routes:

```typescript
export const revalidate = 3600 // Revalidate every hour

export async function GET() {
  // Your API logic
}
```

### Use Static Generation

For pages that don't change often:

```typescript
export const dynamic = 'force-static'
export const revalidate = 3600
```

### Optimize Images

```typescript
import Image from 'next/image'

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority // For above-the-fold images
  placeholder="blur" // Optional blur placeholder
/>
```

## Security Checklist

- [ ] All environment variables are set
- [ ] Service role key is kept secret (not exposed to client)
- [ ] RLS policies are enabled on all tables
- [ ] CORS is configured correctly
- [ ] Rate limiting is implemented
- [ ] Input validation is in place
- [ ] SQL injection prevention is active
- [ ] XSS protection is enabled
- [ ] HTTPS is enforced
- [ ] Security headers are configured

## Support

If you continue to have deployment issues:

1. Check Vercel Status: https://www.vercel-status.com/
2. Review Vercel Docs: https://vercel.com/docs
3. Check Next.js Docs: https://nextjs.org/docs
4. Review build logs for specific errors
5. Contact Vercel Support if needed

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)

---

**Last Updated**: March 18, 2026
**Status**: ✅ Ready for Deployment
