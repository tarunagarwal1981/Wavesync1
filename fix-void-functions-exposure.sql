-- ============================================
-- FIX: EXPOSE VOID FUNCTIONS TO POSTGREST
-- ============================================
-- PostgREST may not automatically expose VOID functions
-- This explicitly ensures they're accessible

-- Step 1: Recreate VOID functions with explicit schema qualification
DROP FUNCTION IF EXISTS public.mark_broadcast_as_read(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.acknowledge_broadcast(uuid) CASCADE;

-- Step 2: Recreate mark_broadcast_as_read
CREATE OR REPLACE FUNCTION public.mark_broadcast_as_read(p_broadcast_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.broadcasts
    WHERE id = p_broadcast_id
  ) THEN
    RAISE EXCEPTION 'Broadcast not found';
  END IF;
  
  INSERT INTO public.broadcast_reads (broadcast_id, user_id, read_at)
  VALUES (p_broadcast_id, auth.uid(), NOW())
  ON CONFLICT (broadcast_id, user_id)
  DO UPDATE SET read_at = NOW();
END;
$$;

-- Step 3: Recreate acknowledge_broadcast
CREATE OR REPLACE FUNCTION public.acknowledge_broadcast(p_broadcast_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.broadcasts
    WHERE id = p_broadcast_id
    AND requires_acknowledgment = TRUE
  ) THEN
    RAISE EXCEPTION 'Broadcast not found or does not require acknowledgment';
  END IF;
  
  INSERT INTO public.broadcast_reads (broadcast_id, user_id, read_at, acknowledged_at)
  VALUES (p_broadcast_id, auth.uid(), NOW(), NOW())
  ON CONFLICT (broadcast_id, user_id)
  DO UPDATE SET 
    acknowledged_at = NOW(),
    read_at = COALESCE(broadcast_reads.read_at, NOW());
END;
$$;

-- Step 4: Explicitly grant permissions
REVOKE ALL ON FUNCTION public.mark_broadcast_as_read(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.acknowledge_broadcast(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.mark_broadcast_as_read(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_broadcast_as_read(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.acknowledge_broadcast(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.acknowledge_broadcast(uuid) TO anon;

-- Step 5: Ensure functions are in exposed schema
-- PostgREST by default exposes functions in the 'public' schema
-- We've explicitly qualified everything with 'public.'

-- Step 6: Force PostgREST schema reload
NOTIFY pgrst, 'reload schema';

-- Step 7: Alternative - try pg_notify if NOTIFY doesn't work
DO $$
BEGIN
  PERFORM pg_notify('pgrst', 'reload schema');
END $$;

-- Step 8: Verify functions are ready
SELECT 
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    CASE 
        WHEN has_function_privilege('authenticated', p.oid, 'EXECUTE') THEN '✅'
        ELSE '❌'
    END as authenticated_can_execute,
    p.prosecdef as is_security_definer
FROM 
    pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE 
    n.nspname = 'public'
    AND p.proname IN ('mark_broadcast_as_read', 'acknowledge_broadcast')
ORDER BY 
    p.proname;

-- ============================================
-- KEY DIFFERENCES FROM WORKING FUNCTIONS:
-- ============================================
-- 1. Added SET search_path = public, pg_temp (ensures schema resolution)
-- 2. Explicitly qualified all tables with 'public.' prefix
-- 3. REVOKE ALL then GRANT (ensures clean permissions)
-- 4. Both NOTIFY and pg_notify (double notification)
--
-- These changes ensure VOID functions are properly exposed
-- ============================================

