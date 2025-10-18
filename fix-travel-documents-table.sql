-- =====================================================
-- FIX TRAVEL DOCUMENTS TABLE
-- =====================================================
-- This script ensures the travel_documents table has the correct structure
-- =====================================================

-- Drop existing table if it has issues
DROP TABLE IF EXISTS travel_documents CASCADE;

-- Ensure document type enum exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'travel_document_type') THEN
    CREATE TYPE travel_document_type AS ENUM (
      'e_ticket', 
      'boarding_pass', 
      'hotel_confirmation', 
      'visa', 
      'insurance', 
      'itinerary', 
      'receipt', 
      'other'
    );
  END IF;
END $$;

-- Create travel_documents table with simplified structure
CREATE TABLE travel_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_request_id UUID REFERENCES travel_requests(id) ON DELETE CASCADE NOT NULL,
  seafarer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Document Details (using VARCHAR instead of enum to avoid issues)
  document_type VARCHAR(50) NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(100),
  
  -- Metadata
  uploaded_by UUID REFERENCES user_profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_travel_documents_travel_request ON travel_documents(travel_request_id);
CREATE INDEX idx_travel_documents_seafarer ON travel_documents(seafarer_id);
CREATE INDEX idx_travel_documents_type ON travel_documents(document_type);

-- Enable RLS
ALTER TABLE travel_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Company users can upload documents for their company" ON travel_documents;
DROP POLICY IF EXISTS "Company users can view documents for their company" ON travel_documents;
DROP POLICY IF EXISTS "Company users can delete documents for their company" ON travel_documents;
DROP POLICY IF EXISTS "Seafarers can view their own documents" ON travel_documents;

-- RLS Policies
-- 1. Company users can upload documents for their company's travel requests
CREATE POLICY "Company users can upload documents for their company"
  ON travel_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN travel_requests tr ON tr.company_id = up.company_id
      WHERE up.id = auth.uid()
      AND tr.id = travel_request_id
      AND up.user_type IN ('company', 'admin')
    )
  );

-- 2. Company users can view documents for their company's travel requests
CREATE POLICY "Company users can view documents for their company"
  ON travel_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN travel_requests tr ON tr.company_id = up.company_id
      WHERE up.id = auth.uid()
      AND tr.id = travel_request_id
      AND up.user_type IN ('company', 'admin')
    )
  );

-- 3. Company users can delete documents for their company's travel requests
CREATE POLICY "Company users can delete documents for their company"
  ON travel_documents
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN travel_requests tr ON tr.company_id = up.company_id
      WHERE up.id = auth.uid()
      AND tr.id = travel_request_id
      AND up.user_type IN ('company', 'admin')
    )
  );

-- 4. Seafarers can view their own documents
CREATE POLICY "Seafarers can view their own documents"
  ON travel_documents
  FOR SELECT
  TO authenticated
  USING (
    seafarer_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.user_type IN ('company', 'admin')
    )
  );

-- Add updated_at trigger
CREATE TRIGGER set_travel_documents_updated_at
  BEFORE UPDATE ON travel_documents
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE 'Travel documents table fixed successfully!';
  RAISE NOTICE 'You can now upload and manage travel documents.';
END $$;
