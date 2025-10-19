-- =====================================================
-- TRAVEL MANAGEMENT STORAGE SETUP
-- =====================================================
-- This script sets up Supabase Storage for travel-related documents
-- Run this in the SQL Editor of your Supabase dashboard

-- =====================================================
-- 1. CREATE STORAGE BUCKET FOR TRAVEL DOCUMENTS
-- =====================================================

-- Create the bucket for travel documents (e-tickets, boarding passes, hotel confirmations, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'travel-documents',
  'travel-documents',
  false, -- Private bucket, requires authentication
  10485760, -- 10MB file size limit
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. STORAGE POLICIES FOR TRAVEL DOCUMENTS
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Seafarers can view their own travel documents" ON storage.objects;
DROP POLICY IF EXISTS "Company users can view travel documents for their company" ON storage.objects;
DROP POLICY IF EXISTS "Company users can upload travel documents" ON storage.objects;
DROP POLICY IF EXISTS "Seafarers can upload their own travel documents" ON storage.objects;
DROP POLICY IF EXISTS "Company users can delete travel documents" ON storage.objects;

-- Policy 1: Seafarers can view their own travel documents
CREATE POLICY "Seafarers can view their own travel documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'travel-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT tr.id::text
    FROM travel_requests tr
    WHERE tr.seafarer_id = auth.uid()
  )
);

-- Policy 2: Company users can view travel documents for their company's seafarers
CREATE POLICY "Company users can view travel documents for their company"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'travel-documents'
  AND EXISTS (
    SELECT 1 
    FROM user_profiles up
    WHERE up.id = auth.uid()
      AND up.user_type = 'company'
      AND up.company_id IN (
        SELECT tr.company_id
        FROM travel_requests tr
        WHERE tr.id::text = (storage.foldername(name))[1]
      )
  )
);

-- Policy 3: Company users can upload travel documents
CREATE POLICY "Company users can upload travel documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'travel-documents'
  AND EXISTS (
    SELECT 1 
    FROM user_profiles up
    INNER JOIN travel_requests tr ON tr.company_id = up.company_id
    WHERE up.id = auth.uid()
      AND up.user_type = 'company'
      AND tr.id::text = (storage.foldername(name))[1]
  )
);

-- Policy 4: Seafarers can upload their own travel documents
CREATE POLICY "Seafarers can upload their own travel documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'travel-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT tr.id::text
    FROM travel_requests tr
    WHERE tr.seafarer_id = auth.uid()
  )
);

-- Policy 5: Company users can delete travel documents
CREATE POLICY "Company users can delete travel documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'travel-documents'
  AND EXISTS (
    SELECT 1 
    FROM user_profiles up
    INNER JOIN travel_requests tr ON tr.company_id = up.company_id
    WHERE up.id = auth.uid()
      AND up.user_type = 'company'
      AND tr.id::text = (storage.foldername(name))[1]
  )
);

-- =====================================================
-- 3. VERIFY STORAGE SETUP
-- =====================================================

-- Check if bucket was created successfully
DO $$
DECLARE
  v_bucket_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'travel-documents'
  ) INTO v_bucket_exists;
  
  IF v_bucket_exists THEN
    RAISE NOTICE '✅ Storage bucket "travel-documents" created successfully';
  ELSE
    RAISE EXCEPTION '❌ Failed to create storage bucket "travel-documents"';
  END IF;
END $$;

-- =====================================================
-- 4. STORAGE USAGE GUIDELINES
-- =====================================================

/*
📁 FOLDER STRUCTURE:
travel-documents/
  └── {travel_request_id}/
      ├── e-ticket.pdf
      ├── boarding-pass.pdf
      ├── hotel-confirmation.pdf
      ├── visa.pdf
      └── insurance.pdf

🔐 ACCESS CONTROL:
- Seafarers: Can view and upload documents for their own travel requests
- Company Users: Can view, upload, and delete documents for all travel requests in their company
- Admin Users: Full access (inherited from being company users)

📝 ALLOWED FILE TYPES:
- PDF documents (preferred for official documents)
- Images (JPEG, PNG, GIF, WebP)
- Word documents (DOC, DOCX)

📏 FILE SIZE LIMIT:
- Maximum 10MB per file

💾 STORAGE PATH FORMAT:
- {travel_request_id}/{document_name}.{extension}
- Example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890/e-ticket.pdf"

🔗 LINKING TO TRAVEL_DOCUMENTS TABLE:
When uploading a file, also insert a record in the travel_documents table:

INSERT INTO travel_documents (
  travel_request_id,
  document_type,
  file_path,
  file_name,
  file_size,
  uploaded_by
) VALUES (
  '{travel_request_id}',
  'e_ticket',
  '{travel_request_id}/e-ticket.pdf',
  'e-ticket.pdf',
  123456,
  '{user_id}'
);
*/

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '✅ TRAVEL STORAGE SETUP COMPLETE!';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '';
  RAISE NOTICE '📦 Storage Bucket:';
  RAISE NOTICE '  - Bucket ID: travel-documents';
  RAISE NOTICE '  - Access: Private (authentication required)';
  RAISE NOTICE '  - File Size Limit: 10MB';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 RLS Policies Created:';
  RAISE NOTICE '  - Seafarers can view their own travel documents';
  RAISE NOTICE '  - Company users can view company travel documents';
  RAISE NOTICE '  - Company users can upload travel documents';
  RAISE NOTICE '  - Seafarers can upload their own travel documents';
  RAISE NOTICE '  - Company users can delete travel documents';
  RAISE NOTICE '';
  RAISE NOTICE '📂 Folder Structure:';
  RAISE NOTICE '  - travel-documents/{travel_request_id}/{filename}';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 To test:';
  RAISE NOTICE '  1. Create a travel request';
  RAISE NOTICE '  2. Upload a document (e-ticket, boarding pass, etc.)';
  RAISE NOTICE '  3. Verify document appears in the travel_documents table';
  RAISE NOTICE '  4. Verify document is accessible via storage URL';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next Steps:';
  RAISE NOTICE '  1. Update TravelManagement component to include file upload';
  RAISE NOTICE '  2. Update MyTravel component to display documents';
  RAISE NOTICE '  3. Create document viewer for e-tickets and confirmations';
  RAISE NOTICE '';
END $$;

