-- This script creates the admin user for abdisa@eversparktech.com
-- Note: This only works AFTER the user has been created in Supabase Auth
-- You need to create the user first via Supabase Dashboard or the Node script

-- Step 1: Go to Supabase Dashboard > Authentication > Users
-- Step 2: Click "Add User" 
-- Step 3: Enter:
--         Email: abdisa@eversparktech.com
--         Password: @Eversparktestdb123456
--         Auto Confirm User: YES
-- Step 4: Copy the User ID
-- Step 5: Replace 'USER_ID_HERE' below with the actual ID and run this script

-- Update profile to super_admin
UPDATE public.profiles 
SET 
  role = 'super_admin',
  full_name = 'Abdisa Admin'
WHERE email = 'abdisa@eversparktech.com';

-- Create admin_users entry
INSERT INTO public.admin_users (user_id, permissions, is_active)
SELECT 
  id,
  '{"can_manage_content": true, "can_manage_users": true, "can_manage_settings": true}'::jsonb,
  true
FROM public.profiles 
WHERE email = 'abdisa@eversparktech.com'
ON CONFLICT (user_id) DO UPDATE 
SET 
  permissions = EXCLUDED.permissions,
  is_active = EXCLUDED.is_active;

-- Verify the admin was created
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  au.permissions,
  au.is_active,
  p.created_at
FROM public.profiles p
LEFT JOIN public.admin_users au ON au.user_id = p.id
WHERE p.email = 'abdisa@eversparktech.com';
