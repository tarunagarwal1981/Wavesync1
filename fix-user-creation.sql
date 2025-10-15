-- Fix user creation by creating a proper database function
-- This will allow us to create users without needing admin API

-- First, let's create a function that can create user profiles
CREATE OR REPLACE FUNCTION create_user_profile(
  p_email TEXT,
  p_full_name TEXT,
  p_user_type TEXT,
  p_phone TEXT DEFAULT NULL,
  p_company_id UUID DEFAULT NULL,
  p_rank TEXT DEFAULT NULL,
  p_experience_years INTEGER DEFAULT NULL,
  p_certificate_number TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Generate a new UUID for the user
  new_user_id := gen_random_uuid();
  
  -- Insert into user_profiles
  INSERT INTO user_profiles (
    id,
    email,
    full_name,
    user_type,
    phone,
    company_id,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    p_email,
    p_full_name,
    p_user_type::user_type,
    p_phone,
    p_company_id,
    NOW(),
    NOW()
  );
  
  -- Create seafarer profile if applicable
  IF p_user_type::user_type = 'seafarer'::user_type THEN
    INSERT INTO seafarer_profiles (
      user_id,
      rank,
      experience_years,
      certificate_number,
      availability_status,
      created_at,
      updated_at
    ) VALUES (
      new_user_id,
      p_rank,
      p_experience_years,
      p_certificate_number,
      'available',
      NOW(),
      NOW()
    );
  END IF;
  
  -- Return success with user ID
  result := json_build_object(
    'success', true,
    'user_id', new_user_id,
    'message', 'User profile created successfully'
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return error
    result := json_build_object(
      'success', false,
      'error', SQLERRM
    );
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile TO authenticated;

-- Also create a function to update user profiles
CREATE OR REPLACE FUNCTION update_user_profile(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_user_type TEXT,
  p_phone TEXT DEFAULT NULL,
  p_company_id UUID DEFAULT NULL,
  p_rank TEXT DEFAULT NULL,
  p_experience_years INTEGER DEFAULT NULL,
  p_certificate_number TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Update user profile
  UPDATE user_profiles SET
    email = p_email,
    full_name = p_full_name,
    user_type = p_user_type::user_type,
    phone = p_phone,
    company_id = p_company_id,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Update seafarer profile if applicable
  IF p_user_type::user_type = 'seafarer'::user_type THEN
    UPDATE seafarer_profiles SET
      rank = p_rank,
      experience_years = p_experience_years,
      certificate_number = p_certificate_number,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
  
  -- Return success
  result := json_build_object(
    'success', true,
    'message', 'User profile updated successfully'
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return error
    result := json_build_object(
      'success', false,
      'error', SQLERRM
    );
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_user_profile TO authenticated;
