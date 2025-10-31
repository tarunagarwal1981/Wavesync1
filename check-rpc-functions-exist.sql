-- ============================================
-- CHECK IF RPC FUNCTIONS EXIST
-- ============================================
-- Run this in Supabase SQL Editor to verify which functions exist

SELECT 
    routine_name as function_name,
    routine_type as type,
    CASE 
        WHEN routine_name IN ('acknowledge_broadcast', 'mark_broadcast_as_read') THEN '⚠️ MISSING - Buttons will not work!'
        ELSE '✅ EXISTS'
    END as status
FROM 
    information_schema.routines 
WHERE 
    routine_schema = 'public' 
    AND routine_name LIKE '%broadcast%'
ORDER BY 
    routine_name;

-- Expected: 6 functions total
-- If you see fewer than 6, run: fix-missing-rpc-functions.sql

-- Also check grants:
SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    r.rolname as granted_to
FROM 
    pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    JOIN pg_depend d ON p.oid = d.objid
    JOIN pg_roles r ON d.refobjid = r.oid
WHERE 
    n.nspname = 'public'
    AND p.proname IN ('acknowledge_broadcast', 'mark_broadcast_as_read')
    AND d.deptype = 'a'
    AND r.rolname = 'authenticated';

-- This will show if EXECUTE permissions were granted

