-- Fix missing user profile for company@wavesync.com
-- This user exists in auth.users but not in user_profiles

-- First, let's check if the user exists in auth.users
SELECT id, email, created_at FROM auth.users WHERE email = 'company@wavesync.com';

-- If the user exists in auth.users but not in user_profiles, create the profile
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  user_type,
  phone,
  company_id,
  created_at,
  updated_at
)
SELECT 
  au.id,
  au.email,
  'Company User',
  'company',
  '+1-555-0002',
  c.id, -- Link to first available company
  au.created_at,
  NOW()
FROM auth.users au
CROSS JOIN (SELECT id FROM companies LIMIT 1) c
WHERE au.email = 'company@wavesync.com'
AND NOT EXISTS (
  SELECT 1 FROM user_profiles up WHERE up.id = au.id
);

-- Verify the profile was created
SELECT * FROM user_profiles WHERE email = 'company@wavesync.com';
