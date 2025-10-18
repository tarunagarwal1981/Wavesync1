-- =====================================================
-- TRAVEL DOCUMENT UPLOAD NOTIFICATION TRIGGER
-- =====================================================
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop existing if present
DROP TRIGGER IF EXISTS notify_travel_document_uploaded ON travel_documents;
DROP FUNCTION IF EXISTS notify_travel_document_uploaded();

-- Create notification template for document uploads
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM notification_templates WHERE name = 'travel_doc_uploaded') THEN
    INSERT INTO notification_templates (name, subject, template, type, variables, is_active, created_at) 
    VALUES (
      'travel_doc_uploaded',
      'New Travel Document',
      'A new travel document ({{document_type}}) has been uploaded for your travel on {{travel_date}}.',
      'info',
      '["document_type", "travel_date"]'::jsonb,
      true,
      NOW()
    );
  END IF;
END $$;

-- Create function to notify seafarer when a document is uploaded
CREATE OR REPLACE FUNCTION notify_travel_document_uploaded()
RETURNS TRIGGER AS $$
DECLARE
  v_travel_request RECORD;
  v_document_type_formatted TEXT;
BEGIN
  -- Get travel request details
  SELECT * INTO v_travel_request
  FROM travel_requests
  WHERE id = NEW.travel_request_id;

  -- Format document type for display
  v_document_type_formatted := REPLACE(INITCAP(REPLACE(NEW.document_type, '_', ' ')), '_', ' ');

  -- Create notification for the seafarer
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    is_read,
    created_at
  ) VALUES (
    v_travel_request.seafarer_id,
    'New Travel Document',
    'A new travel document (' || v_document_type_formatted || ') has been uploaded for your travel on ' || 
      TO_CHAR(v_travel_request.travel_date, 'Mon DD, YYYY') || '.',
    'info',
    false,
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER notify_travel_document_uploaded
AFTER INSERT ON travel_documents
FOR EACH ROW
EXECUTE FUNCTION notify_travel_document_uploaded();
