-- ============================================================================
-- WAVESYNC NOTIFICATION SYSTEM - QUICK TEST SCRIPT
-- ============================================================================
-- Run this script after setting up the notification system to verify everything works

-- ============================================================================
-- TEST 1: Verify Functions Exist
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 1: Checking Notification Functions';
  RAISE NOTICE '========================================';
END $$;

SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name IN ('create_notification', 'create_company_notification', 'create_seafarer_notification')
AND routine_schema = 'public';

-- Expected: 3 rows

-- ============================================================================
-- TEST 2: Verify Triggers Exist
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 2: Checking Notification Triggers';
  RAISE NOTICE '========================================';
END $$;

SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name IN (
  'assignment_notifications_trigger',
  'document_expiry_notifications_trigger',
  'vessel_notifications_trigger'
);

-- Expected: 3 rows

-- ============================================================================
-- TEST 3: Verify Notification Templates
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 3: Checking Notification Templates';
  RAISE NOTICE '========================================';
END $$;

SELECT 
  name,
  type,
  subject
FROM notification_templates
ORDER BY type, name;

-- Expected: 8 rows

-- ============================================================================
-- TEST 4: Check Existing Notifications
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 4: Checking Existing Notifications';
  RAISE NOTICE '========================================';
END $$;

SELECT 
  n.title,
  n.type,
  n.read,
  up.full_name as recipient,
  up.user_type,
  n.created_at
FROM notifications n
JOIN user_profiles up ON n.user_id = up.id
ORDER BY n.created_at DESC
LIMIT 10;

-- Expected: At least a few sample notifications

-- ============================================================================
-- TEST 5: Check Notification Preferences
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 5: Checking Notification Preferences';
  RAISE NOTICE '========================================';
END $$;

SELECT 
  up.full_name,
  up.user_type,
  unp.notification_type,
  unp.email_enabled,
  unp.in_app_enabled
FROM user_notification_preferences unp
JOIN user_profiles up ON unp.user_id = up.id
ORDER BY up.full_name, unp.notification_type;

-- Expected: Multiple rows (one per user per notification type)

-- ============================================================================
-- TEST 6: Test create_notification Function
-- ============================================================================
DO $$
DECLARE
  test_user_id UUID;
  new_notification_id UUID;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 6: Testing create_notification Function';
  RAISE NOTICE '========================================';
  
  -- Get a test user
  SELECT id INTO test_user_id 
  FROM user_profiles 
  WHERE user_type = 'admin' 
  LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE NOTICE '❌ No admin user found to test with';
    RETURN;
  END IF;
  
  -- Create a test notification
  SELECT create_notification(
    test_user_id,
    'Test Notification',
    'This is a test notification created by the test script',
    'info'
  ) INTO new_notification_id;
  
  IF new_notification_id IS NOT NULL THEN
    RAISE NOTICE '✅ Test notification created successfully with ID: %', new_notification_id;
  ELSE
    RAISE NOTICE '❌ Failed to create test notification';
  END IF;
END $$;

-- ============================================================================
-- TEST 7: Test create_company_notification Function
-- ============================================================================
DO $$
DECLARE
  test_company_id UUID;
  notification_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 7: Testing create_company_notification Function';
  RAISE NOTICE '========================================';
  
  -- Get a test company
  SELECT company_id INTO test_company_id 
  FROM user_profiles 
  WHERE company_id IS NOT NULL 
  LIMIT 1;
  
  IF test_company_id IS NULL THEN
    RAISE NOTICE '❌ No company found to test with';
    RETURN;
  END IF;
  
  -- Create company-wide notification
  SELECT create_company_notification(
    test_company_id,
    'Company Test Notification',
    'This is a company-wide test notification',
    'info'
  ) INTO notification_count;
  
  RAISE NOTICE '✅ Created % company-wide notifications', notification_count;
END $$;

-- ============================================================================
-- TEST 8: Verify RLS Policies
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 8: Checking RLS Policies on Notifications Table';
  RAISE NOTICE '========================================';
END $$;

SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'notifications';

-- Expected: Policies for SELECT, UPDATE, DELETE (at minimum)

-- ============================================================================
-- TEST 9: Check Realtime Publication
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 9: Checking Realtime Publication';
  RAISE NOTICE '========================================';
END $$;

SELECT 
  pubname,
  tablename
FROM pg_publication_tables
WHERE tablename = 'notifications';

-- Expected: At least one publication (supabase_realtime)

-- ============================================================================
-- TEST 10: Summary Statistics
-- ============================================================================
DO $$
DECLARE
  total_notifications INTEGER;
  unread_notifications INTEGER;
  total_users INTEGER;
  users_with_prefs INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 10: Summary Statistics';
  RAISE NOTICE '========================================';
  
  SELECT COUNT(*) INTO total_notifications FROM notifications;
  SELECT COUNT(*) INTO unread_notifications FROM notifications WHERE read = false;
  SELECT COUNT(*) INTO total_users FROM user_profiles;
  SELECT COUNT(DISTINCT user_id) INTO users_with_prefs FROM user_notification_preferences;
  
  RAISE NOTICE 'Total Notifications: %', total_notifications;
  RAISE NOTICE 'Unread Notifications: %', unread_notifications;
  RAISE NOTICE 'Total Users: %', total_users;
  RAISE NOTICE 'Users with Preferences: %', users_with_prefs;
END $$;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ NOTIFICATION SYSTEM TEST COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Review the results above to verify:';
  RAISE NOTICE '  1. All functions are created (3 functions)';
  RAISE NOTICE '  2. All triggers are active (3 triggers)';
  RAISE NOTICE '  3. Templates are loaded (8 templates)';
  RAISE NOTICE '  4. Sample notifications exist';
  RAISE NOTICE '  5. Test notifications were created';
  RAISE NOTICE '  6. RLS policies are in place';
  RAISE NOTICE '  7. Realtime is enabled';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next Steps:';
  RAISE NOTICE '  1. Test the UI by running: npm run dev';
  RAISE NOTICE '  2. Login and check the notification bell';
  RAISE NOTICE '  3. Create assignments/documents/vessels to test triggers';
  RAISE NOTICE '  4. Refer to NOTIFICATION_TESTING_GUIDE.md for detailed tests';
  RAISE NOTICE '';
END $$;
