-- ============================================
-- VERIFY RPC FUNCTIONS FOR BROADCAST SYSTEM
-- ============================================
-- Run this in Supabase SQL Editor to check which functions exist
-- Expected: 6 functions

SELECT 
    routine_name as function_name,
    routine_type as type
FROM 
    information_schema.routines 
WHERE 
    routine_schema = 'public' 
    AND routine_name LIKE '%broadcast%'
ORDER BY 
    routine_name;

-- Expected results:
-- 1. acknowledge_broadcast
-- 2. get_broadcast_analytics
-- 3. get_broadcast_recipients
-- 4. get_my_broadcasts
-- 5. get_unread_broadcasts_count
-- 6. mark_broadcast_as_read

-- If you see fewer than 6 functions, you need to run the migration again!

