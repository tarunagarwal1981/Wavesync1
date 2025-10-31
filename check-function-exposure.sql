-- ============================================
-- CHECK FUNCTION EXPOSURE TO POSTGREST
-- ============================================
-- Compare working vs non-working functions

-- Check all broadcast functions and their return types
SELECT 
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_arguments(p.oid) as arguments,
    p.prosecdef as is_security_definer,
    n.nspname as schema,
    CASE 
        WHEN pg_get_function_result(p.oid) = 'void' THEN '⚠️ VOID - May need special handling'
        ELSE '✅ Returns data'
    END as exposure_risk
FROM 
    pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE 
    n.nspname = 'public'
    AND p.proname LIKE '%broadcast%'
ORDER BY 
    p.proname;

-- Check if VOID functions are visible to PostgREST
-- PostgREST may not expose VOID functions by default in some configurations

-- Expected: VOID functions might not be in PostgREST's exposed schema list

