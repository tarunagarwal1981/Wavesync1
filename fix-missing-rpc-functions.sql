-- ============================================
-- FIX: ADD MISSING RPC FUNCTIONS
-- ============================================
-- Run this in Supabase SQL Editor to add the two missing functions
-- This fixes the "404 Not Found" errors for acknowledge and mark as read

-- Function to mark broadcast as read
CREATE OR REPLACE FUNCTION mark_broadcast_as_read(p_broadcast_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Check if broadcast exists and user has access to it
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to acknowledge broadcast
CREATE OR REPLACE FUNCTION acknowledge_broadcast(p_broadcast_id UUID)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION mark_broadcast_as_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION acknowledge_broadcast(UUID) TO authenticated;

-- Verify functions were created
SELECT 
    routine_name as function_name,
    'Created successfully!' as status
FROM 
    information_schema.routines 
WHERE 
    routine_schema = 'public' 
    AND routine_name IN ('mark_broadcast_as_read', 'acknowledge_broadcast')
ORDER BY 
    routine_name;

-- ============================================
-- Expected output:
-- function_name            | status
-- ------------------------ | -------------------
-- acknowledge_broadcast    | Created successfully!
-- mark_broadcast_as_read   | Created successfully!
-- ============================================

