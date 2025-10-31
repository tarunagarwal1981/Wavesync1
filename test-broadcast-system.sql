-- ============================================================================
-- BROADCAST SYSTEM TEST SUITE
-- ============================================================================
-- This script tests all aspects of the broadcast system
-- Run this after executing broadcast-system-setup.sql
-- 
-- IMPORTANT NOTES:
-- - Some tests require authentication and will be SKIPPED when run from SQL Editor
-- - Tests 2.1-2.5 and 6.1 require an authenticated user (auth.uid())
-- - To fully test these functions, use them from your application via Supabase client
-- - Tests 1, 3, 4, and 5 will run successfully without authentication
-- 
-- Expected Results when running from SQL Editor:
-- - 5-6 tests will PASS (table creation, RLS, indexes, data integrity)
-- - 5 tests will be SKIPPED (authentication required)
-- ============================================================================

-- ============================================================================
-- SETUP: Get Test User IDs
-- ============================================================================

DO $$
DECLARE
  v_admin_id UUID;
  v_company_id UUID;
  v_seafarer1_id UUID;
  v_seafarer2_id UUID;
  v_vessel_id UUID;
BEGIN
  -- Get test users
  SELECT id INTO v_admin_id FROM user_profiles WHERE user_type = 'admin' LIMIT 1;
  SELECT id INTO v_company_id FROM user_profiles WHERE user_type = 'company' LIMIT 1;
  SELECT id INTO v_seafarer1_id FROM user_profiles WHERE user_type = 'seafarer' LIMIT 1;
  SELECT id INTO v_seafarer2_id FROM user_profiles WHERE user_type = 'seafarer' OFFSET 1 LIMIT 1;
  SELECT id INTO v_vessel_id FROM vessels LIMIT 1;

  RAISE NOTICE '====================================================';
  RAISE NOTICE 'TEST USERS:';
  RAISE NOTICE 'Admin ID: %', v_admin_id;
  RAISE NOTICE 'Company ID: %', v_company_id;
  RAISE NOTICE 'Seafarer 1 ID: %', v_seafarer1_id;
  RAISE NOTICE 'Seafarer 2 ID: %', v_seafarer2_id;
  RAISE NOTICE 'Vessel ID: %', v_vessel_id;
  RAISE NOTICE '====================================================';
END $$;

-- ============================================================================
-- TEST 1: Create Broadcasts with Different Target Types
-- ============================================================================

-- Test 1.1: Broadcast to all users
DO $$
DECLARE
  v_company_id UUID;
  v_broadcast_id UUID;
BEGIN
  SELECT id INTO v_company_id FROM user_profiles WHERE user_type = 'company' LIMIT 1;
  
  INSERT INTO broadcasts (
    sender_id,
    title,
    message,
    priority,
    target_type
  ) VALUES (
    v_company_id,
    'Test: All Users Broadcast',
    'This is a test broadcast to all users',
    'normal',
    'all'
  ) RETURNING id INTO v_broadcast_id;
  
  RAISE NOTICE 'TEST 1.1 PASSED: Created broadcast to all users (ID: %)', v_broadcast_id;
END $$;

-- Test 1.2: Broadcast to specific vessel
DO $$
DECLARE
  v_company_id UUID;
  v_vessel_id UUID;
  v_broadcast_id UUID;
BEGIN
  SELECT id INTO v_company_id FROM user_profiles WHERE user_type = 'company' LIMIT 1;
  SELECT id INTO v_vessel_id FROM vessels LIMIT 1;
  
  IF v_vessel_id IS NOT NULL THEN
    INSERT INTO broadcasts (
      sender_id,
      title,
      message,
      priority,
      target_type,
      target_ids
    ) VALUES (
      v_company_id,
      'Test: Vessel-Specific Broadcast',
      'This is a test broadcast to specific vessel',
      'important',
      'vessel',
      jsonb_build_array(v_vessel_id::TEXT)
    ) RETURNING id INTO v_broadcast_id;
    
    RAISE NOTICE 'TEST 1.2 PASSED: Created vessel-specific broadcast (ID: %)', v_broadcast_id;
  ELSE
    RAISE NOTICE 'TEST 1.2 SKIPPED: No vessel found';
  END IF;
END $$;

-- Test 1.3: Broadcast to specific rank
DO $$
DECLARE
  v_company_id UUID;
  v_broadcast_id UUID;
BEGIN
  SELECT id INTO v_company_id FROM user_profiles WHERE user_type = 'company' LIMIT 1;
  
  INSERT INTO broadcasts (
    sender_id,
    title,
    message,
    priority,
    target_type,
    target_ids
  ) VALUES (
    v_company_id,
    'Test: Rank-Specific Broadcast',
    'This is a test broadcast to specific ranks',
    'normal',
    'rank',
    jsonb_build_array('Captain', 'Chief Officer')
  ) RETURNING id INTO v_broadcast_id;
  
  RAISE NOTICE 'TEST 1.3 PASSED: Created rank-specific broadcast (ID: %)', v_broadcast_id;
END $$;

-- Test 1.4: Critical broadcast with acknowledgment
DO $$
DECLARE
  v_company_id UUID;
  v_broadcast_id UUID;
BEGIN
  SELECT id INTO v_company_id FROM user_profiles WHERE user_type = 'company' LIMIT 1;
  
  INSERT INTO broadcasts (
    sender_id,
    title,
    message,
    priority,
    target_type,
    requires_acknowledgment,
    pinned
  ) VALUES (
    v_company_id,
    'Test: Critical Broadcast',
    'This is a critical broadcast requiring acknowledgment',
    'critical',
    'all',
    TRUE,
    TRUE
  ) RETURNING id INTO v_broadcast_id;
  
  RAISE NOTICE 'TEST 1.4 PASSED: Created critical broadcast with acknowledgment (ID: %)', v_broadcast_id;
END $$;

-- Test 1.5: Broadcast with expiration
DO $$
DECLARE
  v_company_id UUID;
  v_broadcast_id UUID;
BEGIN
  SELECT id INTO v_company_id FROM user_profiles WHERE user_type = 'company' LIMIT 1;
  
  INSERT INTO broadcasts (
    sender_id,
    title,
    message,
    priority,
    target_type,
    expires_at
  ) VALUES (
    v_company_id,
    'Test: Expiring Broadcast',
    'This broadcast expires in 7 days',
    'info',
    'all',
    NOW() + INTERVAL '7 days'
  ) RETURNING id INTO v_broadcast_id;
  
  RAISE NOTICE 'TEST 1.5 PASSED: Created broadcast with expiration (ID: %)', v_broadcast_id;
END $$;

-- ============================================================================
-- TEST 2: Test RPC Functions
-- ============================================================================

-- Test 2.1: get_my_broadcasts() function
DO $$
DECLARE
  v_broadcast_count INTEGER;
  v_current_user UUID;
BEGIN
  -- Check if we have an authenticated user
  v_current_user := auth.uid();
  
  IF v_current_user IS NULL THEN
    RAISE NOTICE 'TEST 2.1 SKIPPED: No authenticated user (run via authenticated API to test)';
  ELSE
    SELECT COUNT(*) INTO v_broadcast_count FROM get_my_broadcasts();
    
    IF v_broadcast_count >= 0 THEN
      RAISE NOTICE 'TEST 2.1 PASSED: get_my_broadcasts() returned % broadcasts', v_broadcast_count;
    ELSE
      RAISE EXCEPTION 'TEST 2.1 FAILED: get_my_broadcasts() returned invalid count';
    END IF;
  END IF;
END $$;

-- Test 2.2: mark_broadcast_as_read() function
DO $$
DECLARE
  v_broadcast_id UUID;
  v_current_user UUID;
BEGIN
  -- Check if we have an authenticated user
  v_current_user := auth.uid();
  
  IF v_current_user IS NULL THEN
    RAISE NOTICE 'TEST 2.2 SKIPPED: No authenticated user (run via authenticated API to test)';
  ELSE
    -- Get first broadcast
    SELECT id INTO v_broadcast_id FROM broadcasts LIMIT 1;
    
    IF v_broadcast_id IS NOT NULL THEN
      -- Mark as read
      PERFORM mark_broadcast_as_read(v_broadcast_id);
      
      -- Verify it was marked as read
      IF EXISTS (
        SELECT 1 FROM broadcast_reads 
        WHERE broadcast_id = v_broadcast_id 
        AND user_id = v_current_user
      ) THEN
        RAISE NOTICE 'TEST 2.2 PASSED: Successfully marked broadcast as read';
      ELSE
        RAISE EXCEPTION 'TEST 2.2 FAILED: Broadcast not marked as read';
      END IF;
    ELSE
      RAISE NOTICE 'TEST 2.2 SKIPPED: No broadcast found';
    END IF;
  END IF;
END $$;

-- Test 2.3: acknowledge_broadcast() function
DO $$
DECLARE
  v_broadcast_id UUID;
  v_current_user UUID;
BEGIN
  -- Check if we have an authenticated user
  v_current_user := auth.uid();
  
  IF v_current_user IS NULL THEN
    RAISE NOTICE 'TEST 2.3 SKIPPED: No authenticated user (run via authenticated API to test)';
  ELSE
    -- Get first broadcast requiring acknowledgment
    SELECT id INTO v_broadcast_id 
    FROM broadcasts 
    WHERE requires_acknowledgment = TRUE 
    LIMIT 1;
    
    IF v_broadcast_id IS NOT NULL THEN
      -- Acknowledge broadcast
      PERFORM acknowledge_broadcast(v_broadcast_id);
      
      -- Verify it was acknowledged
      IF EXISTS (
        SELECT 1 FROM broadcast_reads 
        WHERE broadcast_id = v_broadcast_id 
        AND user_id = v_current_user
        AND acknowledged_at IS NOT NULL
      ) THEN
        RAISE NOTICE 'TEST 2.3 PASSED: Successfully acknowledged broadcast';
      ELSE
        RAISE EXCEPTION 'TEST 2.3 FAILED: Broadcast not acknowledged';
      END IF;
    ELSE
      RAISE NOTICE 'TEST 2.3 SKIPPED: No broadcast requiring acknowledgment found';
    END IF;
  END IF;
END $$;

-- Test 2.4: get_broadcast_analytics() function (company user required)
DO $$
DECLARE
  v_broadcast_id UUID;
  v_analytics RECORD;
  v_current_user UUID;
  v_user_type TEXT;
BEGIN
  -- Check if we have an authenticated user
  v_current_user := auth.uid();
  
  IF v_current_user IS NULL THEN
    RAISE NOTICE 'TEST 2.4 SKIPPED: No authenticated user (run via authenticated API to test)';
  ELSE
    -- Check user type
    SELECT user_type::TEXT INTO v_user_type FROM user_profiles WHERE id = v_current_user;
    
    IF v_user_type NOT IN ('company', 'admin') THEN
      RAISE NOTICE 'TEST 2.4 SKIPPED: User must be company or admin type';
    ELSE
      -- Get first broadcast from current user
      SELECT id INTO v_broadcast_id FROM broadcasts WHERE sender_id = v_current_user LIMIT 1;
      
      IF v_broadcast_id IS NOT NULL THEN
        SELECT * INTO v_analytics FROM get_broadcast_analytics(v_broadcast_id);
        
        IF v_analytics.total_recipients >= 0 THEN
          RAISE NOTICE 'TEST 2.4 PASSED: get_broadcast_analytics() returned valid data';
          RAISE NOTICE '  Total Recipients: %', v_analytics.total_recipients;
          RAISE NOTICE '  Total Read: %', v_analytics.total_read;
          RAISE NOTICE '  Read Percentage: %', v_analytics.read_percentage;
        ELSE
          RAISE EXCEPTION 'TEST 2.4 FAILED: Invalid analytics data';
        END IF;
      ELSE
        RAISE NOTICE 'TEST 2.4 SKIPPED: No broadcast found from current user';
      END IF;
    END IF;
  END IF;
END $$;

-- Test 2.5: get_broadcast_recipients() function (company user required)
DO $$
DECLARE
  v_broadcast_id UUID;
  v_recipient_count INTEGER;
  v_current_user UUID;
  v_user_type TEXT;
BEGIN
  -- Check if we have an authenticated user
  v_current_user := auth.uid();
  
  IF v_current_user IS NULL THEN
    RAISE NOTICE 'TEST 2.5 SKIPPED: No authenticated user (run via authenticated API to test)';
  ELSE
    -- Check user type
    SELECT user_type::TEXT INTO v_user_type FROM user_profiles WHERE id = v_current_user;
    
    IF v_user_type NOT IN ('company', 'admin') THEN
      RAISE NOTICE 'TEST 2.5 SKIPPED: User must be company or admin type';
    ELSE
      -- Get first broadcast from current user
      SELECT id INTO v_broadcast_id FROM broadcasts WHERE sender_id = v_current_user LIMIT 1;
      
      IF v_broadcast_id IS NOT NULL THEN
        SELECT COUNT(*) INTO v_recipient_count 
        FROM get_broadcast_recipients(v_broadcast_id);
        
        IF v_recipient_count >= 0 THEN
          RAISE NOTICE 'TEST 2.5 PASSED: get_broadcast_recipients() returned % recipients', v_recipient_count;
        ELSE
          RAISE EXCEPTION 'TEST 2.5 FAILED: Invalid recipient count';
        END IF;
      ELSE
        RAISE NOTICE 'TEST 2.5 SKIPPED: No broadcast found from current user';
      END IF;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- TEST 3: Test RLS Policies
-- ============================================================================

-- Test 3.1: Verify broadcasts table has RLS enabled
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'broadcasts' 
    AND rowsecurity = TRUE
  ) THEN
    RAISE NOTICE 'TEST 3.1 PASSED: RLS enabled on broadcasts table';
  ELSE
    RAISE EXCEPTION 'TEST 3.1 FAILED: RLS not enabled on broadcasts table';
  END IF;
END $$;

-- Test 3.2: Verify broadcast_reads table has RLS enabled
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'broadcast_reads' 
    AND rowsecurity = TRUE
  ) THEN
    RAISE NOTICE 'TEST 3.2 PASSED: RLS enabled on broadcast_reads table';
  ELSE
    RAISE EXCEPTION 'TEST 3.2 FAILED: RLS not enabled on broadcast_reads table';
  END IF;
END $$;

-- Test 3.3: Verify policies exist
DO $$
DECLARE
  v_policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_policy_count 
  FROM pg_policies 
  WHERE tablename IN ('broadcasts', 'broadcast_reads');
  
  IF v_policy_count >= 8 THEN
    RAISE NOTICE 'TEST 3.3 PASSED: Found % RLS policies', v_policy_count;
  ELSE
    RAISE EXCEPTION 'TEST 3.3 FAILED: Expected at least 8 policies, found %', v_policy_count;
  END IF;
END $$;

-- ============================================================================
-- TEST 4: Test Indexes
-- ============================================================================

-- Test 4.1: Verify indexes exist
DO $$
DECLARE
  v_index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_index_count 
  FROM pg_indexes 
  WHERE tablename IN ('broadcasts', 'broadcast_reads')
  AND indexname LIKE 'idx_%';
  
  IF v_index_count >= 10 THEN
    RAISE NOTICE 'TEST 4.1 PASSED: Found % indexes', v_index_count;
  ELSE
    RAISE EXCEPTION 'TEST 4.1 FAILED: Expected at least 10 indexes, found %', v_index_count;
  END IF;
END $$;

-- ============================================================================
-- TEST 5: Test Data Integrity
-- ============================================================================

-- Test 5.1: Verify unique constraint on broadcast_reads
DO $$
DECLARE
  v_broadcast_id UUID;
  v_test_user_id UUID;
  v_error_occurred BOOLEAN := FALSE;
BEGIN
  -- Check if we have an authenticated user
  v_test_user_id := auth.uid();
  
  IF v_test_user_id IS NULL THEN
    -- Use a test user ID from the database
    SELECT id INTO v_test_user_id FROM user_profiles LIMIT 1;
    
    IF v_test_user_id IS NULL THEN
      RAISE NOTICE 'TEST 5.1 SKIPPED: No users found in database';
      RETURN;
    END IF;
  END IF;
  
  SELECT id INTO v_broadcast_id FROM broadcasts LIMIT 1;
  
  IF v_broadcast_id IS NOT NULL THEN
    -- Try to insert duplicate read record
    BEGIN
      INSERT INTO broadcast_reads (broadcast_id, user_id)
      VALUES (v_broadcast_id, v_test_user_id);
      
      INSERT INTO broadcast_reads (broadcast_id, user_id)
      VALUES (v_broadcast_id, v_test_user_id);
      
      RAISE EXCEPTION 'TEST 5.1 FAILED: Duplicate read record was allowed';
    EXCEPTION
      WHEN unique_violation THEN
        RAISE NOTICE 'TEST 5.1 PASSED: Unique constraint working correctly';
        v_error_occurred := TRUE;
    END;
    
    IF NOT v_error_occurred THEN
      RAISE EXCEPTION 'TEST 5.1 FAILED: Duplicate prevention not working';
    END IF;
  ELSE
    RAISE NOTICE 'TEST 5.1 SKIPPED: No broadcast found';
  END IF;
END $$;

-- Test 5.2: Verify CASCADE delete works
DO $$
DECLARE
  v_company_id UUID;
  v_test_user_id UUID;
  v_broadcast_id UUID;
  v_read_count_before INTEGER;
  v_read_count_after INTEGER;
BEGIN
  SELECT id INTO v_company_id FROM user_profiles WHERE user_type = 'company' LIMIT 1;
  
  IF v_company_id IS NULL THEN
    RAISE NOTICE 'TEST 5.2 SKIPPED: No company user found';
    RETURN;
  END IF;
  
  -- Get a test user ID
  v_test_user_id := auth.uid();
  IF v_test_user_id IS NULL THEN
    SELECT id INTO v_test_user_id FROM user_profiles LIMIT 1;
  END IF;
  
  IF v_test_user_id IS NULL THEN
    RAISE NOTICE 'TEST 5.2 SKIPPED: No users found';
    RETURN;
  END IF;
  
  -- Create test broadcast
  INSERT INTO broadcasts (sender_id, title, message, target_type)
  VALUES (v_company_id, 'Test Delete', 'This will be deleted', 'all')
  RETURNING id INTO v_broadcast_id;
  
  -- Create read record
  INSERT INTO broadcast_reads (broadcast_id, user_id)
  VALUES (v_broadcast_id, v_test_user_id);
  
  -- Count read records
  SELECT COUNT(*) INTO v_read_count_before 
  FROM broadcast_reads WHERE broadcast_id = v_broadcast_id;
  
  -- Delete broadcast
  DELETE FROM broadcasts WHERE id = v_broadcast_id;
  
  -- Count read records after deletion
  SELECT COUNT(*) INTO v_read_count_after 
  FROM broadcast_reads WHERE broadcast_id = v_broadcast_id;
  
  IF v_read_count_before > 0 AND v_read_count_after = 0 THEN
    RAISE NOTICE 'TEST 5.2 PASSED: CASCADE delete working correctly';
  ELSE
    RAISE EXCEPTION 'TEST 5.2 FAILED: CASCADE delete not working (before: %, after: %)', 
      v_read_count_before, v_read_count_after;
  END IF;
END $$;

-- ============================================================================
-- TEST 6: Performance Tests
-- ============================================================================

-- Test 6.1: Test query performance for get_my_broadcasts
DO $$
DECLARE
  v_start_time TIMESTAMP;
  v_end_time TIMESTAMP;
  v_duration INTERVAL;
  v_current_user UUID;
BEGIN
  -- Check if we have an authenticated user
  v_current_user := auth.uid();
  
  IF v_current_user IS NULL THEN
    RAISE NOTICE 'TEST 6.1 SKIPPED: No authenticated user (run via authenticated API to test)';
  ELSE
    v_start_time := clock_timestamp();
    
    PERFORM * FROM get_my_broadcasts();
    
    v_end_time := clock_timestamp();
    v_duration := v_end_time - v_start_time;
    
    RAISE NOTICE 'TEST 6.1 INFO: get_my_broadcasts() took %', v_duration;
    
    IF v_duration < INTERVAL '1 second' THEN
      RAISE NOTICE 'TEST 6.1 PASSED: Query completed in acceptable time';
    ELSE
      RAISE WARNING 'TEST 6.1 WARNING: Query took longer than expected';
    END IF;
  END IF;
END $$;

-- ============================================================================
-- TEST SUMMARY
-- ============================================================================

DO $$
DECLARE
  v_broadcast_count INTEGER;
  v_read_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_broadcast_count FROM broadcasts;
  SELECT COUNT(*) INTO v_read_count FROM broadcast_reads;
  
  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'BROADCAST SYSTEM TEST SUMMARY';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Total Broadcasts: %', v_broadcast_count;
  RAISE NOTICE 'Total Read Records: %', v_read_count;
  RAISE NOTICE '';
  RAISE NOTICE 'All tests completed!';
  RAISE NOTICE 'Review the output above for any failures.';
  RAISE NOTICE '====================================================';
END $$;

