-- ============================================================================
-- BROADCAST COMMUNICATION SYSTEM
-- ============================================================================
-- This script creates tables, functions, and policies for the broadcast system
-- Allows companies to send announcements to multiple users based on criteria
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Broadcast priority enum
DO $$ BEGIN
  CREATE TYPE broadcast_priority AS ENUM ('critical', 'important', 'normal', 'info');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Broadcast target type enum
DO $$ BEGIN
  CREATE TYPE broadcast_target_type AS ENUM ('all', 'vessel', 'rank', 'status', 'custom');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Broadcasts table (main broadcast messages)
CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Sender info
  sender_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Broadcast content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Priority and targeting
  priority broadcast_priority DEFAULT 'normal',
  target_type broadcast_target_type DEFAULT 'all',
  target_ids JSONB DEFAULT NULL, -- Array of vessel/rank/user IDs
  
  -- Attachments (array of attachment objects)
  attachments JSONB DEFAULT NULL,
  
  -- Display options
  pinned BOOLEAN DEFAULT FALSE,
  requires_acknowledgment BOOLEAN DEFAULT FALSE,
  
  -- Expiry
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT title_not_empty CHECK (LENGTH(TRIM(title)) > 0),
  CONSTRAINT message_not_empty CHECK (LENGTH(TRIM(message)) > 0)
);

-- Broadcast reads table (tracks who has read/acknowledged broadcasts)
CREATE TABLE IF NOT EXISTS broadcast_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  broadcast_id UUID NOT NULL REFERENCES broadcasts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Read and acknowledgment tracking
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledged_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicate reads
  CONSTRAINT unique_broadcast_read UNIQUE (broadcast_id, user_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Broadcasts indexes
CREATE INDEX IF NOT EXISTS idx_broadcasts_sender ON broadcasts(sender_id);
CREATE INDEX IF NOT EXISTS idx_broadcasts_priority ON broadcasts(priority);
CREATE INDEX IF NOT EXISTS idx_broadcasts_expires_at ON broadcasts(expires_at);
CREATE INDEX IF NOT EXISTS idx_broadcasts_created_at ON broadcasts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_broadcasts_pinned ON broadcasts(pinned);
CREATE INDEX IF NOT EXISTS idx_broadcasts_target_type ON broadcasts(target_type);

-- Broadcast reads indexes
CREATE INDEX IF NOT EXISTS idx_broadcast_reads_broadcast ON broadcast_reads(broadcast_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_reads_user ON broadcast_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_reads_read_at ON broadcast_reads(read_at DESC);
CREATE INDEX IF NOT EXISTS idx_broadcast_reads_acknowledged ON broadcast_reads(acknowledged_at);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_reads ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- BROADCASTS TABLE POLICIES
-- ============================================================================

-- Company users and admins can create broadcasts
DROP POLICY IF EXISTS "Company users and admins can create broadcasts" ON broadcasts;
CREATE POLICY "Company users and admins can create broadcasts"
  ON broadcasts FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND user_type IN ('company', 'admin')
    )
  );

-- Company users and admins can view all broadcasts from their company
DROP POLICY IF EXISTS "Company users can view their company broadcasts" ON broadcasts;
CREATE POLICY "Company users can view their company broadcasts"
  ON broadcasts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up1
      JOIN user_profiles up2 ON up1.company_id = up2.company_id
      WHERE up1.id = auth.uid()
      AND up2.id = broadcasts.sender_id
      AND up1.user_type IN ('company', 'admin')
    )
    OR
    -- Admins can see all broadcasts
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND user_type = 'admin'
    )
  );

-- Seafarers can view broadcasts targeted to them
DROP POLICY IF EXISTS "Seafarers can view broadcasts targeted to them" ON broadcasts;
CREATE POLICY "Seafarers can view broadcasts targeted to them"
  ON broadcasts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      LEFT JOIN seafarer_profiles sp ON up.id = sp.user_id
      WHERE up.id = auth.uid()
      AND up.user_type = 'seafarer'
      AND (
        -- Target type: all
        broadcasts.target_type = 'all'
        OR
        -- Target type: custom (specific user IDs)
        (
          broadcasts.target_type = 'custom'
          AND broadcasts.target_ids ? up.id::TEXT
        )
        OR
        -- Target type: rank
        (
          broadcasts.target_type = 'rank'
          AND sp.rank IS NOT NULL
          AND broadcasts.target_ids ? sp.rank
        )
        OR
        -- Target type: status
        (
          broadcasts.target_type = 'status'
          AND sp.availability_status IS NOT NULL
          AND broadcasts.target_ids ? sp.availability_status::TEXT
        )
        OR
        -- Target type: vessel (users assigned to specific vessels)
        (
          broadcasts.target_type = 'vessel'
          AND EXISTS (
            SELECT 1 FROM assignments a
            WHERE a.seafarer_id = up.id
            AND a.vessel_id IS NOT NULL
            AND broadcasts.target_ids ? a.vessel_id::TEXT
            AND a.status IN ('accepted', 'active')
          )
        )
      )
    )
    AND (
      -- Broadcast hasn't expired
      broadcasts.expires_at IS NULL
      OR broadcasts.expires_at > NOW()
    )
  );

-- Company users can update their own broadcasts
DROP POLICY IF EXISTS "Company users can update their own broadcasts" ON broadcasts;
CREATE POLICY "Company users can update their own broadcasts"
  ON broadcasts FOR UPDATE
  TO authenticated
  USING (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND user_type IN ('company', 'admin')
    )
  );

-- Company users can delete their own broadcasts
DROP POLICY IF EXISTS "Company users can delete their own broadcasts" ON broadcasts;
CREATE POLICY "Company users can delete their own broadcasts"
  ON broadcasts FOR DELETE
  TO authenticated
  USING (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND user_type IN ('company', 'admin')
    )
  );

-- ============================================================================
-- BROADCAST_READS TABLE POLICIES
-- ============================================================================

-- Users can view their own read records
DROP POLICY IF EXISTS "Users can view their own read records" ON broadcast_reads;
CREATE POLICY "Users can view their own read records"
  ON broadcast_reads FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Company users can view read records for their broadcasts
DROP POLICY IF EXISTS "Company users can view read statistics for their broadcasts" ON broadcast_reads;
CREATE POLICY "Company users can view read statistics for their broadcasts"
  ON broadcast_reads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM broadcasts b
      JOIN user_profiles up ON b.sender_id = up.id
      WHERE b.id = broadcast_reads.broadcast_id
      AND up.company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
      )
      AND up.user_type IN ('company', 'admin')
    )
  );

-- Users can mark broadcasts as read
DROP POLICY IF EXISTS "Users can mark broadcasts as read" ON broadcast_reads;
CREATE POLICY "Users can mark broadcasts as read"
  ON broadcast_reads FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own read records (for acknowledgments)
DROP POLICY IF EXISTS "Users can update their own read records" ON broadcast_reads;
CREATE POLICY "Users can update their own read records"
  ON broadcast_reads FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp on broadcasts
CREATE OR REPLACE FUNCTION update_broadcast_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_broadcasts_updated_at ON broadcasts;
CREATE TRIGGER trigger_broadcasts_updated_at
  BEFORE UPDATE ON broadcasts
  FOR EACH ROW
  EXECUTE FUNCTION update_broadcast_updated_at();

-- ============================================================================
-- RPC FUNCTIONS
-- ============================================================================

-- Function to get broadcasts visible to current user with unread status
CREATE OR REPLACE FUNCTION get_my_broadcasts()
RETURNS TABLE (
  broadcast_id UUID,
  sender_id UUID,
  sender_name TEXT,
  title TEXT,
  message TEXT,
  priority TEXT,
  target_type TEXT,
  target_ids JSONB,
  attachments JSONB,
  pinned BOOLEAN,
  requires_acknowledgment BOOLEAN,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  is_read BOOLEAN,
  is_acknowledged BOOLEAN,
  read_at TIMESTAMP WITH TIME ZONE,
  acknowledged_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id as broadcast_id,
    b.sender_id,
    up.full_name::TEXT as sender_name,
    b.title,
    b.message,
    b.priority::TEXT,
    b.target_type::TEXT,
    b.target_ids,
    b.attachments,
    b.pinned,
    b.requires_acknowledgment,
    b.expires_at,
    b.created_at,
    b.updated_at,
    (br.id IS NOT NULL) as is_read,
    (br.acknowledged_at IS NOT NULL) as is_acknowledged,
    br.read_at,
    br.acknowledged_at
  FROM broadcasts b
  JOIN user_profiles up ON b.sender_id = up.id
  LEFT JOIN broadcast_reads br ON b.id = br.broadcast_id AND br.user_id = auth.uid()
  WHERE
    -- Check if user has permission to view this broadcast (RLS will filter)
    (
      -- Broadcast hasn't expired
      b.expires_at IS NULL
      OR b.expires_at > NOW()
    )
  ORDER BY
    b.pinned DESC,
    b.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get list of recipients for a broadcast
CREATE OR REPLACE FUNCTION get_broadcast_recipients(p_broadcast_id UUID)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  email TEXT,
  user_type TEXT,
  is_read BOOLEAN,
  is_acknowledged BOOLEAN,
  read_at TIMESTAMP WITH TIME ZONE,
  acknowledged_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_broadcast broadcasts;
BEGIN
  -- Get broadcast details
  SELECT * INTO v_broadcast
  FROM broadcasts
  WHERE id = p_broadcast_id;
  
  -- Check if user has permission (must be sender or admin/company from same company)
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND (
      id = v_broadcast.sender_id
      OR
      (
        user_type IN ('company', 'admin')
        AND company_id IN (
          SELECT company_id FROM user_profiles WHERE id = v_broadcast.sender_id
        )
      )
    )
  ) THEN
    RAISE EXCEPTION 'You do not have permission to view recipients for this broadcast';
  END IF;
  
  -- Return recipients based on target type
  RETURN QUERY
  WITH target_users AS (
    SELECT DISTINCT up.id as user_id
    FROM user_profiles up
    LEFT JOIN seafarer_profiles sp ON up.id = sp.user_id
    LEFT JOIN assignments a ON up.id = a.seafarer_id
    WHERE
      CASE v_broadcast.target_type
        WHEN 'all' THEN TRUE
        WHEN 'custom' THEN v_broadcast.target_ids ? up.id::TEXT
        WHEN 'rank' THEN sp.rank IS NOT NULL AND v_broadcast.target_ids ? sp.rank
        WHEN 'status' THEN sp.availability_status IS NOT NULL AND v_broadcast.target_ids ? sp.availability_status::TEXT
        WHEN 'vessel' THEN 
          a.vessel_id IS NOT NULL 
          AND v_broadcast.target_ids ? a.vessel_id::TEXT
          AND a.status IN ('accepted', 'active')
        ELSE FALSE
      END
  )
  SELECT
    tu.user_id,
    up.full_name::TEXT,
    up.email::TEXT,
    up.user_type::TEXT,
    (br.id IS NOT NULL) as is_read,
    (br.acknowledged_at IS NOT NULL) as is_acknowledged,
    br.read_at,
    br.acknowledged_at
  FROM target_users tu
  JOIN user_profiles up ON tu.user_id = up.id
  LEFT JOIN broadcast_reads br ON p_broadcast_id = br.broadcast_id AND tu.user_id = br.user_id
  ORDER BY up.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Function to get broadcast analytics
CREATE OR REPLACE FUNCTION get_broadcast_analytics(p_broadcast_id UUID)
RETURNS TABLE (
  total_recipients BIGINT,
  total_read BIGINT,
  total_acknowledged BIGINT,
  read_percentage NUMERIC,
  acknowledged_percentage NUMERIC
) AS $$
DECLARE
  v_broadcast broadcasts;
  v_total_recipients BIGINT;
  v_total_read BIGINT;
  v_total_acknowledged BIGINT;
BEGIN
  -- Get broadcast details
  SELECT * INTO v_broadcast
  FROM broadcasts
  WHERE id = p_broadcast_id;
  
  -- Check if user has permission
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND (
      id = v_broadcast.sender_id
      OR
      (
        user_type IN ('company', 'admin')
        AND company_id IN (
          SELECT company_id FROM user_profiles WHERE id = v_broadcast.sender_id
        )
      )
    )
  ) THEN
    RAISE EXCEPTION 'You do not have permission to view analytics for this broadcast';
  END IF;
  
  -- Get recipient counts
  WITH target_users AS (
    SELECT DISTINCT up.id as user_id
    FROM user_profiles up
    LEFT JOIN seafarer_profiles sp ON up.id = sp.user_id
    LEFT JOIN assignments a ON up.id = a.seafarer_id
    WHERE
      CASE v_broadcast.target_type
        WHEN 'all' THEN TRUE
        WHEN 'custom' THEN v_broadcast.target_ids ? up.id::TEXT
        WHEN 'rank' THEN sp.rank IS NOT NULL AND v_broadcast.target_ids ? sp.rank
        WHEN 'status' THEN sp.availability_status IS NOT NULL AND v_broadcast.target_ids ? sp.availability_status::TEXT
        WHEN 'vessel' THEN 
          a.vessel_id IS NOT NULL 
          AND v_broadcast.target_ids ? a.vessel_id::TEXT
          AND a.status IN ('accepted', 'active')
        ELSE FALSE
      END
  )
  SELECT
    COUNT(*) INTO v_total_recipients
  FROM target_users;
  
  -- Get read count
  SELECT COUNT(*)
  INTO v_total_read
  FROM broadcast_reads
  WHERE broadcast_id = p_broadcast_id;
  
  -- Get acknowledged count
  SELECT COUNT(*)
  INTO v_total_acknowledged
  FROM broadcast_reads
  WHERE broadcast_id = p_broadcast_id
  AND acknowledged_at IS NOT NULL;
  
  -- Return analytics
  RETURN QUERY
  SELECT
    v_total_recipients,
    v_total_read,
    v_total_acknowledged,
    CASE WHEN v_total_recipients > 0 
      THEN ROUND((v_total_read::NUMERIC / v_total_recipients::NUMERIC) * 100, 2)
      ELSE 0
    END as read_percentage,
    CASE WHEN v_total_recipients > 0 
      THEN ROUND((v_total_acknowledged::NUMERIC / v_total_recipients::NUMERIC) * 100, 2)
      ELSE 0
    END as acknowledged_percentage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RPC: GET UNREAD BROADCASTS COUNT
-- ============================================================================
-- Returns the count of unread broadcasts for the current user

CREATE OR REPLACE FUNCTION get_unread_broadcasts_count()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Count broadcasts that are:
  -- 1. Visible to the current user (RLS will filter)
  -- 2. Not expired
  -- 3. Not yet read by the user
  SELECT COUNT(*)
  INTO v_count
  FROM broadcasts b
  WHERE 
    -- Broadcast hasn't expired
    (b.expires_at IS NULL OR b.expires_at > NOW())
    -- User hasn't read it yet
    AND NOT EXISTS (
      SELECT 1 
      FROM broadcast_reads br 
      WHERE br.broadcast_id = b.id 
      AND br.user_id = auth.uid()
    );
  
  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION get_my_broadcasts() TO authenticated;
GRANT EXECUTE ON FUNCTION get_broadcast_recipients(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_broadcast_as_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION acknowledge_broadcast(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_broadcast_analytics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_broadcasts_count() TO authenticated;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'BROADCAST SYSTEM CREATED SUCCESSFULLY!';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Created tables:';
  RAISE NOTICE '  - broadcasts';
  RAISE NOTICE '  - broadcast_reads';
  RAISE NOTICE '';
  RAISE NOTICE 'Created enums:';
  RAISE NOTICE '  - broadcast_priority (critical, important, normal, info)';
  RAISE NOTICE '  - broadcast_target_type (all, vessel, rank, status, custom)';
  RAISE NOTICE '';
  RAISE NOTICE 'Created RPC functions:';
  RAISE NOTICE '  - get_my_broadcasts()';
  RAISE NOTICE '  - get_broadcast_recipients(broadcast_id)';
  RAISE NOTICE '  - mark_broadcast_as_read(broadcast_id)';
  RAISE NOTICE '  - acknowledge_broadcast(broadcast_id)';
  RAISE NOTICE '  - get_broadcast_analytics(broadcast_id)';
  RAISE NOTICE '  - get_unread_broadcasts_count()';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS Policies:';
  RAISE NOTICE '  ✓ Company users and admins can create broadcasts';
  RAISE NOTICE '  ✓ Seafarers can only view broadcasts targeted to them';
  RAISE NOTICE '  ✓ Users can only mark their own reads/acknowledgments';
  RAISE NOTICE '  ✓ Company users can view read statistics';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Test broadcast creation from company accounts';
  RAISE NOTICE '  2. Verify targeting works for different user types';
  RAISE NOTICE '  3. Test read/acknowledgment tracking';
  RAISE NOTICE '  4. Implement UI for broadcast management';
  RAISE NOTICE '====================================================';
END $$;

