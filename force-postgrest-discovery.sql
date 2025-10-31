-- ============================================
-- FORCE POSTGREST TO DISCOVER RPC FUNCTIONS
-- ============================================
-- This aggressively recreates functions and forces PostgREST refresh

-- Step 1: Drop functions completely
DROP FUNCTION IF EXISTS public.mark_broadcast_as_read(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.acknowledge_broadcast(uuid) CASCADE;

-- Step 2: Recreate mark_broadcast_as_read with explicit schema
CREATE OR REPLACE FUNCTION public.mark_broadcast_as_read(p_broadcast_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Step 3: Recreate acknowledge_broadcast with explicit schema
CREATE OR REPLACE FUNCTION public.acknowledge_broadcast(p_broadcast_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Step 4: Grant permissions explicitly
GRANT EXECUTE ON FUNCTION public.mark_broadcast_as_read(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_broadcast_as_read(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.acknowledge_broadcast(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.acknowledge_broadcast(uuid) TO anon;

-- Step 5: Force PostgREST to reload schema
-- This is the KEY step - notifies PostgREST to refresh
NOTIFY pgrst, 'reload schema';

-- Step 6: Also try alternative notification method
DO $$
BEGIN
  PERFORM pg_notify('pgrst', 'reload schema');
END $$;

-- Step 7: Verify functions are visible
SELECT 
    p.proname as function_name,
    n.nspname as schema,
    pg_get_function_identity_arguments(p.oid) as arguments,
    CASE 
        WHEN has_function_privilege('authenticated', p.oid, 'EXECUTE') THEN '✅'
        ELSE '❌'
    END as authenticated_permission
FROM 
    pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE 
    n.nspname = 'public'
    AND p.proname IN ('mark_broadcast_as_read', 'acknowledge_broadcast')
ORDER BY 
    p.proname;

-- Wait a moment for PostgREST to process the notification
-- (You'll need to wait 10-30 seconds after running this)

-- ============================================
-- After running this:
-- 1. Wait 30 seconds
-- 2. Hard refresh browser (Ctrl+Shift+R)
-- 3. Test buttons again
-- ============================================

