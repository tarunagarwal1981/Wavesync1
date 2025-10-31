-- Quick check: Do authenticated users have EXECUTE permission?
SELECT 
    p.proname as function_name,
    r.rolname as role,
    CASE 
        WHEN has_function_privilege(r.oid, p.oid, 'EXECUTE') THEN '✅ YES'
        ELSE '❌ NO - NEEDS FIX!'
    END as can_execute
FROM 
    pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    CROSS JOIN pg_roles r
WHERE 
    n.nspname = 'public'
    AND p.proname IN ('mark_broadcast_as_read', 'acknowledge_broadcast')
    AND r.rolname IN ('authenticated', 'anon')
ORDER BY 
    p.proname, r.rolname;

-- Expected if WORKING:
-- function_name          | role          | can_execute
-- ---------------------- | ------------- | -----------
-- acknowledge_broadcast  | authenticated | ✅ YES
-- acknowledge_broadcast  | anon          | ✅ YES
-- mark_broadcast_as_read | authenticated | ✅ YES
-- mark_broadcast_as_read | anon          | ✅ YES

-- If you see ❌ NO, then run fix-rpc-permissions.sql

