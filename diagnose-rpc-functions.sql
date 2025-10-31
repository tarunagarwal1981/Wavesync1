-- ============================================
-- DIAGNOSE RPC FUNCTION ISSUES
-- ============================================
-- Run this to check why functions return 404

-- 1. Check if functions exist in public schema
SELECT 
    routine_name,
    routine_schema,
    routine_type,
    data_type as return_type
FROM 
    information_schema.routines 
WHERE 
    routine_schema = 'public' 
    AND routine_name IN ('mark_broadcast_as_read', 'acknowledge_broadcast')
ORDER BY 
    routine_name;

-- 2. Check function parameters/signatures
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM 
    pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE 
    n.nspname = 'public'
    AND p.proname IN ('mark_broadcast_as_read', 'acknowledge_broadcast')
ORDER BY 
    p.proname;

-- 3. Check EXECUTE permissions
SELECT 
    p.proname as function_name,
    r.rolname as granted_to,
    CASE 
        WHEN has_function_privilege(r.oid, p.oid, 'EXECUTE') THEN '✅ YES'
        ELSE '❌ NO'
    END as has_execute_permission
FROM 
    pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    CROSS JOIN pg_roles r
WHERE 
    n.nspname = 'public'
    AND p.proname IN ('mark_broadcast_as_read', 'acknowledge_broadcast')
    AND r.rolname IN ('authenticated', 'anon', 'postgres')
ORDER BY 
    p.proname, r.rolname;

-- 4. Check if functions are SECURITY DEFINER (they should be)
SELECT 
    p.proname as function_name,
    p.prosecdef as is_security_definer,
    CASE 
        WHEN p.prosecdef THEN '✅ YES (Correct)'
        ELSE '❌ NO (Should be SECURITY DEFINER)'
    END as status
FROM 
    pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE 
    n.nspname = 'public'
    AND p.proname IN ('mark_broadcast_as_read', 'acknowledge_broadcast')
ORDER BY 
    p.proname;

-- Expected Results:
-- 1. Both functions should exist in 'public' schema
-- 2. Arguments should be: "p_broadcast_id uuid"
-- 3. 'authenticated' role should have EXECUTE permission ✅
-- 4. Both should be SECURITY DEFINER ✅

