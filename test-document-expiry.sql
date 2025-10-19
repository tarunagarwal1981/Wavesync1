-- ============================================================================
-- TEST DATA FOR DOCUMENT EXPIRY SYSTEM
-- ============================================================================
-- This script creates test documents with various expiry dates to test
-- the document expiry and compliance tracking system

-- ============================================================================
-- STEP 1: Get Test Users
-- ============================================================================

DO $$
DECLARE
  seafarer_user_id UUID;
  company_user_id UUID;
  company_id_value UUID;
  test_file_url TEXT := 'https://example.com/test-document.pdf';
BEGIN
  -- Get a seafarer user
  SELECT id INTO seafarer_user_id
  FROM user_profiles
  WHERE user_type = 'seafarer'
  LIMIT 1;

  -- Get a company user and their company
  SELECT id, company_id INTO company_user_id, company_id_value
  FROM user_profiles
  WHERE user_type = 'company'
    AND company_id IS NOT NULL
  LIMIT 1;

  -- Verify we have users
  IF seafarer_user_id IS NULL THEN
    RAISE EXCEPTION 'No seafarer user found. Please create a seafarer user first.';
  END IF;

  IF company_user_id IS NULL THEN
    RAISE EXCEPTION 'No company user found. Please create a company user first.';
  END IF;

  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Using Seafarer ID: %', seafarer_user_id;
  RAISE NOTICE 'Using Company ID: %', company_id_value;
  RAISE NOTICE '====================================================';

  -- ============================================================================
  -- STEP 2: Create Test Documents with Various Expiry Dates
  -- ============================================================================

  -- 1. EXPIRED - Expired 30 days ago (CRITICAL)
  INSERT INTO documents (
    user_id,
    filename,
    file_url,
    document_type,
    description,
    expiry_date,
    status,
    uploaded_at
  ) VALUES (
    seafarer_user_id,
    'EXPIRED_STCW_Certificate.pdf',
    test_file_url,
    'STCW Certificate',
    'This certificate has expired 30 days ago',
    CURRENT_DATE - INTERVAL '30 days',
    'approved',
    NOW() - INTERVAL '6 months'
  );

  -- 2. EXPIRED - Expired 5 days ago (CRITICAL)
  INSERT INTO documents (
    user_id,
    filename,
    file_url,
    document_type,
    description,
    expiry_date,
    status,
    uploaded_at
  ) VALUES (
    seafarer_user_id,
    'EXPIRED_Medical_Certificate.pdf',
    test_file_url,
    'Medical Certificate',
    'Medical certificate expired recently',
    CURRENT_DATE - INTERVAL '5 days',
    'approved',
    NOW() - INTERVAL '4 months'
  );

  -- 3. EXPIRING URGENT - Expires in 5 days (HIGH PRIORITY)
  INSERT INTO documents (
    user_id,
    filename,
    file_url,
    document_type,
    description,
    expiry_date,
    status,
    uploaded_at
  ) VALUES (
    seafarer_user_id,
    'Passport_Expiring_Soon.pdf',
    test_file_url,
    'Passport',
    'Passport expires in 5 days - URGENT',
    CURRENT_DATE + INTERVAL '5 days',
    'approved',
    NOW() - INTERVAL '2 months'
  );

  -- 4. EXPIRING URGENT - Expires in 15 days (HIGH PRIORITY)
  INSERT INTO documents (
    user_id,
    filename,
    file_url,
    document_type,
    description,
    expiry_date,
    status,
    uploaded_at
  ) VALUES (
    seafarer_user_id,
    'Visa_Expiring_15_Days.pdf',
    test_file_url,
    'Visa',
    'Visa expires in 15 days',
    CURRENT_DATE + INTERVAL '15 days',
    'approved',
    NOW() - INTERVAL '1 month'
  );

  -- 5. EXPIRING URGENT - Expires in 29 days (HIGH PRIORITY)
  INSERT INTO documents (
    user_id,
    filename,
    file_url,
    document_type,
    description,
    expiry_date,
    status,
    uploaded_at
  ) VALUES (
    seafarer_user_id,
    'Seamans_Book_29_Days.pdf',
    test_file_url,
    'Seamans Book',
    'Seamans book expires in 29 days',
    CURRENT_DATE + INTERVAL '29 days',
    'approved',
    NOW() - INTERVAL '3 weeks'
  );

  -- 6. EXPIRING SOON - Expires in 45 days (MEDIUM PRIORITY)
  INSERT INTO documents (
    user_id,
    filename,
    file_url,
    document_type,
    description,
    expiry_date,
    status,
    uploaded_at
  ) VALUES (
    seafarer_user_id,
    'Training_Certificate_45_Days.pdf',
    test_file_url,
    'Training Certificate',
    'Training certificate expires in 45 days',
    CURRENT_DATE + INTERVAL '45 days',
    'approved',
    NOW() - INTERVAL '2 weeks'
  );

  -- 7. EXPIRING SOON - Expires in 60 days (MEDIUM PRIORITY)
  INSERT INTO documents (
    user_id,
    filename,
    file_url,
    document_type,
    description,
    expiry_date,
    status,
    uploaded_at
  ) VALUES (
    seafarer_user_id,
    'Safety_Certificate_60_Days.pdf',
    test_file_url,
    'Safety Certificate',
    'Safety certificate expires in 60 days',
    CURRENT_DATE + INTERVAL '60 days',
    'approved',
    NOW() - INTERVAL '1 week'
  );

  -- 8. EXPIRING SOON - Expires in 89 days (MEDIUM PRIORITY)
  INSERT INTO documents (
    user_id,
    filename,
    file_url,
    document_type,
    description,
    expiry_date,
    status,
    uploaded_at
  ) VALUES (
    seafarer_user_id,
    'Medical_Checkup_89_Days.pdf',
    test_file_url,
    'Medical Certificate',
    'Medical certificate expires in 89 days',
    CURRENT_DATE + INTERVAL '89 days',
    'approved',
    NOW() - INTERVAL '3 days'
  );

  -- 9. VALID - Expires in 120 days (LOW PRIORITY)
  INSERT INTO documents (
    user_id,
    filename,
    file_url,
    document_type,
    description,
    expiry_date,
    status,
    uploaded_at
  ) VALUES (
    seafarer_user_id,
    'Valid_Certificate_120_Days.pdf',
    test_file_url,
    'Training Certificate',
    'Valid certificate with 120 days remaining',
    CURRENT_DATE + INTERVAL '120 days',
    'approved',
    NOW() - INTERVAL '1 day'
  );

  -- 10. VALID - Expires in 1 year (LOW PRIORITY)
  INSERT INTO documents (
    user_id,
    filename,
    file_url,
    document_type,
    description,
    expiry_date,
    status,
    uploaded_at
  ) VALUES (
    seafarer_user_id,
    'Valid_Passport_1_Year.pdf',
    test_file_url,
    'Passport',
    'Valid passport with 1 year remaining',
    CURRENT_DATE + INTERVAL '1 year',
    'approved',
    NOW()
  );

  -- 11. NO EXPIRY - Document without expiry date
  INSERT INTO documents (
    user_id,
    filename,
    file_url,
    document_type,
    description,
    expiry_date,
    status,
    uploaded_at
  ) VALUES (
    seafarer_user_id,
    'Birth_Certificate.pdf',
    test_file_url,
    'Other',
    'Birth certificate - no expiry',
    NULL,
    'approved',
    NOW()
  );

  -- ============================================================================
  -- STEP 3: Test Expiry Status Calculations
  -- ============================================================================

  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'TESTING EXPIRY STATUS CALCULATIONS';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '';

  -- Test status calculation for each document
  RAISE NOTICE 'Document Expiry Status Summary:';
  RAISE NOTICE '---------------------------------------------------';
  
  DECLARE
    rec RECORD;
  BEGIN
    FOR rec IN 
      SELECT 
        filename,
        expiry_date,
        get_days_until_expiry(expiry_date) as days_remaining,
        get_document_expiry_status(expiry_date) as status
      FROM documents
      WHERE user_id = seafarer_user_id
      ORDER BY 
        CASE 
          WHEN expiry_date IS NULL THEN 999999
          ELSE get_days_until_expiry(expiry_date)
        END ASC
    LOOP
      IF rec.expiry_date IS NULL THEN
        RAISE NOTICE '% - NO EXPIRY', rec.filename;
      ELSE
        RAISE NOTICE '% - Status: % (% days)', 
          rec.filename, 
          rec.status, 
          rec.days_remaining;
      END IF;
    END LOOP;
  END;

  -- ============================================================================
  -- STEP 4: Test Company Summary
  -- ============================================================================

  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'COMPANY EXPIRY SUMMARY';
  RAISE NOTICE '====================================================';
  
  DECLARE
    summary_json JSON;
  BEGIN
    SELECT get_company_expiry_summary(company_id_value) INTO summary_json;
    RAISE NOTICE 'Summary: %', summary_json::TEXT;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Error getting summary: %', SQLERRM;
  END;

  -- ============================================================================
  -- STEP 5: Test Notification System
  -- ============================================================================

  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'TESTING NOTIFICATION SYSTEM';
  RAISE NOTICE '====================================================';
  
  DECLARE
    doc_count INTEGER;
    notif_count INTEGER;
  BEGIN
    SELECT * INTO doc_count, notif_count FROM check_expiring_documents();
    RAISE NOTICE 'Documents checked: %', doc_count;
    RAISE NOTICE 'Notifications created: %', notif_count;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Error checking documents: %', SQLERRM;
  END;

  -- ============================================================================
  -- COMPLETION
  -- ============================================================================

  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'TEST DATA CREATED SUCCESSFULLY!';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Created 11 test documents:';
  RAISE NOTICE '  - 2 Expired (critical)';
  RAISE NOTICE '  - 3 Expiring Urgent (<30 days)';
  RAISE NOTICE '  - 3 Expiring Soon (30-90 days)';
  RAISE NOTICE '  - 2 Valid (>90 days)';
  RAISE NOTICE '  - 1 No Expiry';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Navigate to /expiry-dashboard as a company user';
  RAISE NOTICE '2. Check the summary cards and filters';
  RAISE NOTICE '3. View notifications in the bell icon';
  RAISE NOTICE '4. Check document badges in Document Management';
  RAISE NOTICE '====================================================';

END $$;

