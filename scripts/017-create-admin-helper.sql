-- Helper script to manually create an admin user
-- Replace the email and user_id with actual values after creating a user in Supabase Auth

-- Step 1: First, create a user in Supabase Auth Dashboard or use the setup page
-- Step 2: Get the user ID from auth.users table
-- Step 3: Run this script with the actual user_id

-- Example: Update a user to admin role
-- UPDATE public.profiles 
-- SET role = 'super_admin', full_name = 'Admin User'
-- WHERE id = 'YOUR-USER-ID-HERE';

-- Example: Create admin_users entry
-- INSERT INTO public.admin_users (user_id, permissions, is_active)
-- VALUES (
--   'YOUR-USER-ID-HERE',
--   '{"can_manage_content": true, "can_manage_users": true, "can_manage_settings": true}',
--   true
-- );

-- To check existing admins:
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.created_at,
  au.permissions,
  au.is_active
FROM public.profiles p
LEFT JOIN public.admin_users au ON au.user_id = p.id
WHERE p.role IN ('admin', 'super_admin')
ORDER BY p.created_at DESC;
