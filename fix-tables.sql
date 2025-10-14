-- Fix RLS policies and create essential tables
-- Run this in Supabase SQL Editor

-- Drop existing tables if they exist
DROP TABLE IF EXISTS seafarer_profiles CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Drop existing types if they exist
DROP TYPE IF EXISTS user_type CASCADE;
DROP TYPE IF EXISTS availability_status CASCADE;

-- Create custom types
CREATE TYPE user_type AS ENUM ('seafarer', 'company', 'admin');
CREATE TYPE availability_status AS ENUM ('available', 'unavailable', 'on_contract');

-- Create companies table
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  website VARCHAR(255),
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  user_type user_type NOT NULL,
  avatar_url TEXT,
  phone VARCHAR(50),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seafarer_profiles table
CREATE TABLE seafarer_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  rank VARCHAR(100) NOT NULL,
  certificate_number VARCHAR(100),
  experience_years INTEGER DEFAULT 0,
  preferred_vessel_types TEXT[],
  availability_status availability_status DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seafarer_profiles ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies (no recursion)
CREATE POLICY "Enable read access for all users" ON companies FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON seafarer_profiles FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Enable update for users based on email" ON user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON seafarer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update for users based on user_id" ON seafarer_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seafarer_profiles_updated_at BEFORE UPDATE ON seafarer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
