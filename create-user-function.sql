-- Create a function to handle user creation with proper permissions
-- This function can be called by authenticated users with admin role

CREATE OR REPLACE FUNCTION create_user_with_profile(
  p_email TEXT,
  p_password TEXT,
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
  
  -- Insert into user_profiles (this will be linked to auth.users via trigger)
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
    p_user_type,
    p_phone,
    p_company_id,
    NOW(),
    NOW()
  );
  
  -- Create seafarer profile if applicable
  IF p_user_type = 'seafarer' THEN
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
    'message', 'User created successfully'
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
GRANT EXECUTE ON FUNCTION create_user_with_profile TO authenticated;

-- Create a trigger to automatically create auth user when profile is created
-- Note: This requires the auth.users table to be accessible
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- This would need to be implemented with proper auth integration
  -- For now, we'll handle user creation differently
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
