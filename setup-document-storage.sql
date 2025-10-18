-- ============================================================================
-- DOCUMENT STORAGE SETUP FOR WAVESYNC MARITIME PLATFORM
-- ============================================================================

-- Create documents storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760, -- 10MB limit
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload documents for their company" ON storage.objects;
DROP POLICY IF EXISTS "Users can view documents for their company" ON storage.objects;
DROP POLICY IF EXISTS "Users can update documents for their company" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete documents for their company" ON storage.objects;

-- Create RLS policies for documents bucket
CREATE POLICY "Users can upload documents for their company" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    (
      -- Company users can upload for any seafarer in their company
      EXISTS (
        SELECT 1 FROM user_profiles up
        WHERE up.id = auth.uid() 
        AND up.user_type IN ('admin', 'company')
        AND (storage.foldername(name))[1] IN (
          SELECT id::text FROM user_profiles 
          WHERE company_id = up.company_id AND user_type = 'seafarer'
        )
      )
      OR
      -- Seafarers can upload their own documents
      (storage.foldername(name))[1] = auth.uid()::text
    )
  );

CREATE POLICY "Users can view documents for their company" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    (
      -- Company users can view documents for seafarers in their company
      EXISTS (
        SELECT 1 FROM user_profiles up
        WHERE up.id = auth.uid()
        AND up.user_type IN ('admin', 'company')
        AND (storage.foldername(name))[1] IN (
          SELECT id::text FROM user_profiles 
          WHERE company_id = up.company_id AND user_type = 'seafarer'
        )
      )
      OR
      -- Seafarers can view their own documents
      (storage.foldername(name))[1] = auth.uid()::text
    )
  );

CREATE POLICY "Users can update documents for their company" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' AND
    (
      -- Company users can update documents for seafarers in their company
      EXISTS (
        SELECT 1 FROM user_profiles up
        WHERE up.id = auth.uid() 
        AND up.user_type IN ('admin', 'company')
        AND (storage.foldername(name))[1] IN (
          SELECT id::text FROM user_profiles 
          WHERE company_id = up.company_id AND user_type = 'seafarer'
        )
      )
      OR
      -- Seafarers can update their own documents
      (storage.foldername(name))[1] = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete documents for their company" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND
    (
      -- Company users can delete documents for seafarers in their company
      EXISTS (
        SELECT 1 FROM user_profiles up
        WHERE up.id = auth.uid() 
        AND up.user_type IN ('admin', 'company')
        AND (storage.foldername(name))[1] IN (
          SELECT id::text FROM user_profiles 
          WHERE company_id = up.company_id AND user_type = 'seafarer'
        )
      )
      OR
      -- Seafarers can delete their own documents
      (storage.foldername(name))[1] = auth.uid()::text
    )
  );

-- ============================================================================
-- DOCUMENT MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to get document expiry alerts
CREATE OR REPLACE FUNCTION get_document_expiry_alerts(days_ahead INTEGER DEFAULT 30)
RETURNS TABLE (
  document_id UUID,
  user_id UUID,
  user_name TEXT,
  document_type TEXT,
  filename TEXT,
  expiry_date DATE,
  days_until_expiry INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.user_id,
    up.full_name,
    d.document_type,
    d.filename,
    d.expiry_date,
    (d.expiry_date - CURRENT_DATE)::INTEGER as days_until_expiry
  FROM documents d
  JOIN user_profiles up ON d.user_id = up.id
  WHERE d.expiry_date IS NOT NULL
    AND d.expiry_date <= (CURRENT_DATE + INTERVAL '1 day' * days_ahead)
    AND d.status = 'approved'
  ORDER BY d.expiry_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update document status
CREATE OR REPLACE FUNCTION update_document_status(
  p_document_id UUID,
  p_status TEXT,
  p_verified_by UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE documents 
  SET 
    status = p_status::document_status,
    verified_at = CASE WHEN p_status = 'approved' THEN NOW() ELSE NULL END,
    verified_by = CASE WHEN p_status = 'approved' THEN p_verified_by ELSE NULL END,
    updated_at = NOW()
  WHERE id = p_document_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DOCUMENT TYPES AND CATEGORIES
-- ============================================================================

-- Note: Document types are handled in the application code
-- The following types are supported:
-- passport, seaman_book, medical_certificate, stcw_certificate, visa,
-- vaccination_certificate, training_certificate, eng1_medical, eng11_medical,
-- coc_certificate, cop_certificate, gmdss_certificate, radar_certificate,
-- arpa_certificate, other

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DOCUMENT STORAGE SETUP COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Storage bucket created: documents';
  RAISE NOTICE 'RLS policies configured for secure access';
  RAISE NOTICE 'Document management functions created';
  RAISE NOTICE 'Document types configured in application';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Test document upload functionality';
  RAISE NOTICE '2. Verify RLS policies work correctly';
  RAISE NOTICE '3. Test document expiry alerts';
  RAISE NOTICE '========================================';
END $$;
