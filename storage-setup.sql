-- ============================================================================
-- WAVESYNC MARITIME PLATFORM - STORAGE SETUP
-- ============================================================================
-- Run this script in Supabase SQL Editor to set up storage buckets for file uploads

-- ============================================================================
-- STEP 1: CREATE STORAGE BUCKETS
-- ============================================================================

-- Create documents bucket for user document uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Create avatars bucket for user profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Create company logos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
);

-- ============================================================================
-- STEP 2: CREATE STORAGE POLICIES
-- ============================================================================

-- Documents bucket policies
CREATE POLICY "Users can upload their own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins can manage all documents
CREATE POLICY "Admins can manage all documents" ON storage.objects
  FOR ALL USING (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Company users can view seafarer documents
CREATE POLICY "Company users can view seafarer documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'company'
    )
  );

-- Avatars bucket policies
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view all avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Company logos bucket policies
CREATE POLICY "Company users can upload their company logo" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'company-logos' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'company'
    )
  );

CREATE POLICY "Anyone can view company logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'company-logos');

CREATE POLICY "Company users can update their company logo" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'company-logos' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'company'
    )
  );

CREATE POLICY "Company users can delete their company logo" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'company-logos' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'company'
    )
  );

-- ============================================================================
-- STEP 3: CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to get storage URL for a file
CREATE OR REPLACE FUNCTION get_storage_url(bucket_name text, file_path text)
RETURNS text AS $$
BEGIN
  RETURN 'https://your-project-ref.supabase.co/storage/v1/object/public/' || bucket_name || '/' || file_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate unique file names
CREATE OR REPLACE FUNCTION generate_unique_filename(user_id uuid, original_filename text)
RETURNS text AS $$
DECLARE
  file_extension text;
  timestamp_str text;
  unique_filename text;
BEGIN
  -- Extract file extension
  file_extension := substring(original_filename from '\.([^.]+)$');
  
  -- Generate timestamp
  timestamp_str := to_char(now(), 'YYYYMMDD_HH24MISS');
  
  -- Create unique filename
  unique_filename := user_id::text || '_' || timestamp_str || '.' || file_extension;
  
  RETURN unique_filename;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'WAVESYNC STORAGE SETUP COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Storage buckets created:';
    RAISE NOTICE '- documents (private, 10MB limit)';
    RAISE NOTICE '- avatars (public, 2MB limit)';
    RAISE NOTICE '- company-logos (public, 5MB limit)';
    RAISE NOTICE 'Storage policies configured for all buckets';
    RAISE NOTICE 'Helper functions created';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update storage URL in helper function';
    RAISE NOTICE '2. Test file upload functionality';
    RAISE NOTICE '3. Verify storage policies work correctly';
    RAISE NOTICE '========================================';
END $$;
