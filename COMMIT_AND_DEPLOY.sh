#!/bin/bash

# Commit and Deploy Script
# This script commits all changes and pushes to GitHub for Vercel deployment

echo "🚀 Starting deployment process..."
echo ""

# Step 1: Add all changes
echo "📦 Step 1: Adding all changes..."
git add .

# Step 2: Commit with message
echo "💾 Step 2: Committing changes..."
git commit -m "fix: resolve build errors and add comprehensive documentation

- Fix syntax errors in app/hr/actions.ts
- Fix incomplete import in app/hr/leave-types/page.tsx
- Update Next.js to 15.3.0 (security patch)
- Remove deprecated @supabase/auth-helpers-nextjs
- Add comprehensive README.md
- Add HR System Documentation
- Add Admin System Documentation
- Add Deployment Guides
- Add environment variable examples"

# Step 3: Push to GitHub
echo "🌐 Step 3: Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Done! Your changes have been pushed to GitHub."
echo ""
echo "📊 Next steps:"
echo "1. Go to Vercel Dashboard: https://vercel.com/dashboard"
echo "2. Watch the deployment progress"
echo "3. Wait for 'Build completed successfully'"
echo "4. Test your deployed application"
echo ""
echo "🔗 Your app will be available at: https://yourdomain.vercel.app"
echo ""
