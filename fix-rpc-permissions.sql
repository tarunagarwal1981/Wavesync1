-- ============================================
-- FIX: GRANT PERMISSIONS TO RPC FUNCTIONS
-- ============================================
-- Run this if functions exist but return 404
-- This ensures permissions are correctly set

-- Drop and recreate with explicit permissions
DROP FUNCTION IF EXISTS mark_broadcast_as_read(UUID);
DROP FUNCTION IF EXISTS acknowledge_broadcast(UUID);

-- Recreate mark_broadcast_as_read
CREATE FUNCTION mark_broadcast_as_read(p_broadcast_id UUID)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if broadcast exists
  IF NOT EXISTS (
    SELECT 1 FROM broadcasts
    WHERE id = p_broadcast_id
  ) THEN
    RAISE EXCEPTION 'Broadcast not found';
  END IF;
  
  -- Insert or update read record
  INSERT INTO broadcast_reads (broadcast_id, user_id, read_at)
  VALUES (p_broadcast_id, auth.uid(), NOW())
  ON CONFLICT (broadcast_id, user_id)
  DO UPDATE SET read_at = NOW();
END;
$$;

-- Recreate acknowledge_broadcast
CREATE FUNCTION acknowledge_broadcast(p_broadcast_id UUID)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if broadcast exists and requires acknowledgment
  IF NOT EXISTS (
    SELECT 1 FROM broadcasts
    WHERE id = p_broadcast_id
    AND requires_acknowledgment = TRUE
  ) THEN
    RAISE EXCEPTION 'Broadcast not found or does not require acknowledgment';
  END IF;
  
  -- Insert or update read record with acknowledgment
  INSERT INTO broadcast_reads (broadcast_id, user_id, read_at, acknowledged_at)
  VALUES (p_broadcast_id, auth.uid(), NOW(), NOW())
  ON CONFLICT (broadcast_id, user_id)
  DO UPDATE SET 
    acknowledged_at = NOW(),
    read_at = COALESCE(broadcast_reads.read_at, NOW());
END;
$$;

-- Grant EXECUTE permissions (CRITICAL - this is often the issue!)
GRANT EXECUTE ON FUNCTION mark_broadcast_as_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_broadcast_as_read(UUID) TO anon;
GRANT EXECUTE ON FUNCTION acknowledge_broadcast(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION acknowledge_broadcast(UUID) TO anon;

-- Also grant to service_role (for admin operations)
GRANT EXECUTE ON FUNCTION mark_broadcast_as_read(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION acknowledge_broadcast(UUID) TO service_role;

-- Verify permissions
SELECT 
    p.proname as function_name,
    r.rolname as role,
    CASE 
        WHEN has_function_privilege(r.oid, p.oid, 'EXECUTE') THEN '✅ YES'
        ELSE '❌ NO'
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

-- ============================================
-- Expected output:
-- function_name            | role          | can_execute
-- ------------------------ | ------------- | -----------
-- acknowledge_broadcast    | authenticated | ✅ YES
-- acknowledge_broadcast    | anon          | ✅ YES
-- mark_broadcast_as_read   | authenticated | ✅ YES
-- mark_broadcast_as_read   | anon          | ✅ YES
-- ============================================

