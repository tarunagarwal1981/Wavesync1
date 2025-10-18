-- =====================================================
-- TRAVEL DOCUMENT UPLOAD NOTIFICATION TRIGGER
-- =====================================================
-- This script creates a notification trigger for when
-- travel documents are uploaded
-- =====================================================

-- Drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS notify_travel_document_uploaded ON travel_documents;
DROP FUNCTION IF EXISTS notify_travel_document_uploaded();

-- Create notification template for document uploads (if not exists)
INSERT INTO notification_templates (id, name, title_template, body_template, notification_type, category, is_active)
VALUES (
  'travel_doc_uploaded',
  'Travel Document Uploaded',
  'New Travel Document',
  'A new travel document ({{document_type}}) has been uploaded for your travel on {{travel_date}}.',
  'info',
  'travel',
  true
)
ON CONFLICT (id) DO UPDATE SET
  title_template = EXCLUDED.title_template,
  body_template = EXCLUDED.body_template,
  notification_type = EXCLUDED.notification_type,
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active;

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
    notification_type,
    category,
    related_entity_type,
    related_entity_id,
    metadata
  ) VALUES (
    v_travel_request.seafarer_id,
    'New Travel Document',
    'A new travel document (' || v_document_type_formatted || ') has been uploaded for your travel on ' || 
      TO_CHAR(v_travel_request.travel_date, 'Mon DD, YYYY') || '.',
    'info',
    'travel',
    'travel_document',
    NEW.id,
    jsonb_build_object(
      'travel_request_id', NEW.travel_request_id,
      'document_type', NEW.document_type,
      'document_name', NEW.document_name,
      'uploaded_by', NEW.uploaded_by
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER notify_travel_document_uploaded
AFTER INSERT ON travel_documents
FOR EACH ROW
EXECUTE FUNCTION notify_travel_document_uploaded();

-- =====================================================
-- VERIFICATION AND TESTING
-- =====================================================

-- Display success message
DO $$
BEGIN
  RAISE NOTICE 'Travel document notification trigger created successfully!';
  RAISE NOTICE 'The system will now notify seafarers when documents are uploaded.';
END $$;

-- Display trigger info
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'notify_travel_document_uploaded';

