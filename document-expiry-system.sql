-- ============================================================================
-- DOCUMENT EXPIRY & COMPLIANCE SYSTEM
-- ============================================================================
-- This script creates the document expiry checking system with automated
-- alerts and compliance tracking for the WaveSync Maritime Platform

-- ============================================================================
-- STEP 1: CREATE EXPIRY STATUS ENUM
-- ============================================================================

-- Document expiry status enum (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_expiry_status') THEN
    CREATE TYPE document_expiry_status AS ENUM (
      'valid',           -- More than 90 days until expiry
      'expiring_soon',   -- 30-90 days until expiry
      'expiring_urgent', -- Less than 30 days until expiry
      'expired',         -- Past expiry date
      'no_expiry'        -- Document doesn't expire
    );
  END IF;
END $$;

-- ============================================================================
-- STEP 2: HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate document expiry status
CREATE OR REPLACE FUNCTION get_document_expiry_status(expiry_date DATE)
RETURNS document_expiry_status AS $$
DECLARE
  days_until_expiry INTEGER;
BEGIN
  -- If no expiry date, return no_expiry
  IF expiry_date IS NULL THEN
    RETURN 'no_expiry';
  END IF;
  
  -- Calculate days until expiry
  days_until_expiry := expiry_date - CURRENT_DATE;
  
  -- Determine status based on days
  IF days_until_expiry < 0 THEN
    RETURN 'expired';
  ELSIF days_until_expiry <= 30 THEN
    RETURN 'expiring_urgent';
  ELSIF days_until_expiry <= 90 THEN
    RETURN 'expiring_soon';
  ELSE
    RETURN 'valid';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get days until expiry
CREATE OR REPLACE FUNCTION get_days_until_expiry(expiry_date DATE)
RETURNS INTEGER AS $$
BEGIN
  IF expiry_date IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN expiry_date - CURRENT_DATE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- STEP 3: DOCUMENT EXPIRY CHECKING FUNCTION
-- ============================================================================

-- Function to check for expiring documents and create notifications
CREATE OR REPLACE FUNCTION check_expiring_documents()
RETURNS TABLE (
  document_count INTEGER,
  notifications_created INTEGER
) AS $$
DECLARE
  doc_record RECORD;
  notification_count INTEGER := 0;
  doc_count INTEGER := 0;
  expiry_status document_expiry_status;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Find documents that are expiring or expired
  FOR doc_record IN 
    SELECT 
      d.id,
      d.user_id,
      d.filename::TEXT as filename,
      d.document_type::TEXT as document_type,
      d.expiry_date,
      up.full_name::TEXT as full_name,
      up.company_id,
      get_document_expiry_status(d.expiry_date) as status,
      get_days_until_expiry(d.expiry_date) as days_until_expiry
    FROM documents d
    LEFT JOIN user_profiles up ON d.user_id = up.id
    WHERE d.expiry_date IS NOT NULL
      AND get_document_expiry_status(d.expiry_date) IN ('expired', 'expiring_urgent', 'expiring_soon')
      -- Only process documents we haven't notified about recently (last 7 days)
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.user_id = d.user_id
          AND n.message LIKE '%' || d.filename || '%'
          AND n.created_at > NOW() - INTERVAL '7 days'
      )
  LOOP
    doc_count := doc_count + 1;
    expiry_status := doc_record.status;
    
    -- Create notification based on status
    IF expiry_status = 'expired' THEN
      notification_title := 'Document Expired';
      notification_message := 'Your document "' || doc_record.filename || '" has expired. Please upload a renewed version immediately.';
      
      -- Notify seafarer
      INSERT INTO notifications (user_id, title, message, type, read, created_at)
      VALUES (doc_record.user_id, notification_title, notification_message, 'error', false, NOW());
      notification_count := notification_count + 1;
      
      -- Notify company if exists
      IF doc_record.company_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, message, type, read, created_at)
        SELECT id, 'Seafarer Document Expired', 
               doc_record.full_name || '''s document "' || doc_record.filename || '" has expired.',
               'error', false, NOW()
        FROM user_profiles
        WHERE company_id = doc_record.company_id 
          AND user_type = 'company'
        LIMIT 1;
        notification_count := notification_count + 1;
      END IF;
      
    ELSIF expiry_status = 'expiring_urgent' THEN
      notification_title := 'Document Expiring Soon (Urgent)';
      notification_message := 'Your document "' || doc_record.filename || '" expires in ' || 
                             doc_record.days_until_expiry || ' days. Please renew it urgently.';
      
      -- Notify seafarer
      INSERT INTO notifications (user_id, title, message, type, read, created_at)
      VALUES (doc_record.user_id, notification_title, notification_message, 'warning', false, NOW());
      notification_count := notification_count + 1;
      
    ELSIF expiry_status = 'expiring_soon' THEN
      notification_title := 'Document Expiring Soon';
      notification_message := 'Your document "' || doc_record.filename || '" expires in ' || 
                             doc_record.days_until_expiry || ' days. Please plan to renew it.';
      
      -- Notify seafarer
      INSERT INTO notifications (user_id, title, message, type, read, created_at)
      VALUES (doc_record.user_id, notification_title, notification_message, 'info', false, NOW());
      notification_count := notification_count + 1;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT doc_count, notification_count;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_expiring_documents() TO authenticated;

-- ============================================================================
-- STEP 4: COMPANY COMPLIANCE VIEWS
-- ============================================================================

-- Function to get expiring documents summary for a company
CREATE OR REPLACE FUNCTION get_company_expiry_summary(p_company_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_documents', COUNT(*),
    'expired', COUNT(*) FILTER (WHERE get_document_expiry_status(d.expiry_date) = 'expired'),
    'expiring_urgent', COUNT(*) FILTER (WHERE get_document_expiry_status(d.expiry_date) = 'expiring_urgent'),
    'expiring_soon', COUNT(*) FILTER (WHERE get_document_expiry_status(d.expiry_date) = 'expiring_soon'),
    'valid', COUNT(*) FILTER (WHERE get_document_expiry_status(d.expiry_date) = 'valid'),
    'no_expiry', COUNT(*) FILTER (WHERE d.expiry_date IS NULL)
  ) INTO result
  FROM documents d
  JOIN user_profiles up ON d.user_id = up.id
  WHERE up.company_id = p_company_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_company_expiry_summary(UUID) TO authenticated;

-- Function to get list of expiring documents for company
CREATE OR REPLACE FUNCTION get_expiring_documents_for_company(
  p_company_id UUID,
  p_status document_expiry_status DEFAULT NULL
)
RETURNS TABLE (
  document_id UUID,
  user_id UUID,
  seafarer_name TEXT,
  filename TEXT,
  document_type TEXT,
  expiry_date DATE,
  days_until_expiry INTEGER,
  status document_expiry_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.user_id,
    up.full_name::TEXT,
    d.filename::TEXT,
    d.document_type::TEXT,
    d.expiry_date,
    get_days_until_expiry(d.expiry_date),
    get_document_expiry_status(d.expiry_date)
  FROM documents d
  JOIN user_profiles up ON d.user_id = up.id
  WHERE up.company_id = p_company_id
    AND d.expiry_date IS NOT NULL
    AND (p_status IS NULL OR get_document_expiry_status(d.expiry_date) = p_status)
  ORDER BY d.expiry_date ASC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_expiring_documents_for_company(UUID, document_expiry_status) TO authenticated;

-- ============================================================================
-- STEP 5: SEAFARER EXPIRY VIEW
-- ============================================================================

-- Function to get expiring documents for a seafarer
CREATE OR REPLACE FUNCTION get_my_expiring_documents()
RETURNS TABLE (
  document_id UUID,
  filename TEXT,
  document_type TEXT,
  expiry_date DATE,
  days_until_expiry INTEGER,
  status document_expiry_status,
  urgency_level TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.filename::TEXT,
    d.document_type::TEXT,
    d.expiry_date,
    get_days_until_expiry(d.expiry_date),
    get_document_expiry_status(d.expiry_date),
    CASE 
      WHEN get_document_expiry_status(d.expiry_date) = 'expired' THEN 'critical'::TEXT
      WHEN get_document_expiry_status(d.expiry_date) = 'expiring_urgent' THEN 'high'::TEXT
      WHEN get_document_expiry_status(d.expiry_date) = 'expiring_soon' THEN 'medium'::TEXT
      ELSE 'low'::TEXT
    END
  FROM documents d
  WHERE d.user_id = auth.uid()
    AND d.expiry_date IS NOT NULL
    AND get_document_expiry_status(d.expiry_date) != 'valid'
  ORDER BY d.expiry_date ASC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_my_expiring_documents() TO authenticated;

-- ============================================================================
-- STEP 6: SCHEDULED JOB (OPTIONAL - Requires pg_cron extension)
-- ============================================================================

-- Note: This requires pg_cron extension to be enabled in Supabase
-- Uncomment and run if you have pg_cron enabled:

/*
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily check at 8 AM UTC
SELECT cron.schedule(
  'check-expiring-documents',
  '0 8 * * *',  -- Every day at 8:00 AM
  'SELECT check_expiring_documents()'
);
*/

-- Alternative: You can call check_expiring_documents() manually or via Edge Function

-- ============================================================================
-- STEP 7: UTILITY FUNCTIONS
-- ============================================================================

-- Function to bulk notify about expiring documents
CREATE OR REPLACE FUNCTION notify_expiring_documents(days_threshold INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  notification_count INTEGER := 0;
  doc_record RECORD;
BEGIN
  -- Find documents expiring within threshold
  FOR doc_record IN 
    SELECT 
      d.id,
      d.user_id,
      d.filename,
      d.expiry_date,
      get_days_until_expiry(d.expiry_date) as days_until_expiry
    FROM documents d
    WHERE d.expiry_date IS NOT NULL
      AND get_days_until_expiry(d.expiry_date) <= days_threshold
      AND get_days_until_expiry(d.expiry_date) >= 0
  LOOP
    -- Create notification
    INSERT INTO notifications (user_id, title, message, type, read, created_at)
    VALUES (
      doc_record.user_id,
      'Document Expiring Soon',
      'Your document "' || doc_record.filename || '" expires in ' || 
      doc_record.days_until_expiry || ' days.',
      'warning',
      false,
      NOW()
    );
    notification_count := notification_count + 1;
  END LOOP;
  
  RETURN notification_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION notify_expiring_documents(INTEGER) TO authenticated;

-- ============================================================================
-- STEP 8: VERIFY SETUP (No migration needed)
-- ============================================================================

-- Note: We don't modify the document 'status' field (approval status)
-- The expiry status is calculated on-the-fly using get_document_expiry_status()
-- The 'status' field is for document approval workflow (pending/approved/rejected)
-- The expiry status is separate and determined by the expiry_date

DO $$
BEGIN
  -- Just verify that documents table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'documents'
  ) THEN
    RAISE NOTICE 'Documents table found. Expiry functions will work with existing data.';
  ELSE
    RAISE WARNING 'Documents table not found. Please ensure it exists before using expiry functions.';
  END IF;
END $$;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$ 
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'DOCUMENT EXPIRY SYSTEM SETUP COMPLETE!';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '  - get_document_expiry_status(date)';
  RAISE NOTICE '  - get_days_until_expiry(date)';
  RAISE NOTICE '  - check_expiring_documents()';
  RAISE NOTICE '  - get_company_expiry_summary(company_id)';
  RAISE NOTICE '  - get_expiring_documents_for_company(company_id, status)';
  RAISE NOTICE '  - get_my_expiring_documents()';
  RAISE NOTICE '  - notify_expiring_documents(days)';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'To manually check expiring documents, run:';
  RAISE NOTICE '  SELECT * FROM check_expiring_documents();';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'To get company expiry summary, run:';
  RAISE NOTICE '  SELECT get_company_expiry_summary(''your-company-id'');';
  RAISE NOTICE '====================================================';
END $$;

