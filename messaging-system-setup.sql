-- ============================================================================
-- MESSAGING & COMMUNICATION SYSTEM
-- ============================================================================
-- This script creates tables and functions for real-time messaging
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Message status enum
DO $$ BEGIN
  CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Conversations table (tracks conversations between users)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Participants (always 2 for direct messaging)
  participant1_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  participant2_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Last message info (for preview)
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_text TEXT,
  last_message_sender_id UUID REFERENCES user_profiles(id),
  
  -- Constraints
  CONSTRAINT different_participants CHECK (participant1_id != participant2_id),
  CONSTRAINT ordered_participants CHECK (participant1_id < participant2_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Conversation reference
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  
  -- Sender info
  sender_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Message content
  message_text TEXT NOT NULL,
  
  -- Attachment (optional)
  attachment_url TEXT,
  attachment_filename TEXT,
  attachment_type TEXT,
  attachment_size INTEGER,
  
  -- Status tracking
  status message_status DEFAULT 'sent',
  
  -- Read tracking
  read_at TIMESTAMP WITH TIME ZONE,
  read_by UUID REFERENCES user_profiles(id),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT messages_text_not_empty CHECK (LENGTH(TRIM(message_text)) > 0 OR attachment_url IS NOT NULL)
);

-- Typing indicators table (ephemeral data)
CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Auto-expire after 5 seconds
  CONSTRAINT typing_not_expired CHECK (started_at > NOW() - INTERVAL '5 seconds')
);

-- User online status table
CREATE TABLE IF NOT EXISTS user_online_status (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_participant1 ON conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2 ON conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);

-- Typing indicators indexes
CREATE INDEX IF NOT EXISTS idx_typing_conversation ON typing_indicators(conversation_id);
CREATE INDEX IF NOT EXISTS idx_typing_user ON typing_indicators(user_id);

-- User online status index
CREATE INDEX IF NOT EXISTS idx_user_online_status_updated ON user_online_status(updated_at DESC);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_online_status ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    participant1_id = auth.uid() OR participant2_id = auth.uid()
  );

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    participant1_id = auth.uid() OR participant2_id = auth.uid()
  );

CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (
    participant1_id = auth.uid() OR participant2_id = auth.uid()
  );

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
    )
  );

-- Typing indicators policies
CREATE POLICY "Users can view typing in their conversations"
  ON typing_indicators FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = typing_indicators.conversation_id
      AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
    )
  );

CREATE POLICY "Users can set their own typing status"
  ON typing_indicators FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Online status policies
CREATE POLICY "Everyone can view online status"
  ON user_online_status FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own online status"
  ON user_online_status FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update conversation timestamp when message is sent
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    updated_at = NEW.created_at,
    last_message_at = NEW.created_at,
    last_message_text = NEW.message_text,
    last_message_sender_id = NEW.sender_id
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON messages;
CREATE TRIGGER trigger_update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_conversations_updated_at ON conversations;
CREATE TRIGGER trigger_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_messages_updated_at ON messages;
CREATE TRIGGER trigger_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RPC FUNCTIONS
-- ============================================================================

-- Get or create conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(p_other_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
  v_participant1 UUID;
  v_participant2 UUID;
BEGIN
  -- Order participants (smaller UUID first)
  IF auth.uid() < p_other_user_id THEN
    v_participant1 := auth.uid();
    v_participant2 := p_other_user_id;
  ELSE
    v_participant1 := p_other_user_id;
    v_participant2 := auth.uid();
  END IF;

  -- Try to find existing conversation
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE participant1_id = v_participant1
    AND participant2_id = v_participant2;

  -- Create if doesn't exist
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (participant1_id, participant2_id)
    VALUES (v_participant1, v_participant2)
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get conversations list with unread counts
CREATE OR REPLACE FUNCTION get_my_conversations()
RETURNS TABLE (
  conversation_id UUID,
  other_user_id UUID,
  other_user_name TEXT,
  other_user_type TEXT,
  last_message_text TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_sender_id UUID,
  unread_count BIGINT,
  is_other_user_online BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id as conversation_id,
    CASE
      WHEN c.participant1_id = auth.uid() THEN c.participant2_id
      ELSE c.participant1_id
    END as other_user_id,
    CASE
      WHEN c.participant1_id = auth.uid() THEN up2.full_name
      ELSE up1.full_name
    END::TEXT as other_user_name,
    CASE
      WHEN c.participant1_id = auth.uid() THEN up2.user_type::TEXT
      ELSE up1.user_type::TEXT
    END as other_user_type,
    c.last_message_text,
    c.last_message_at,
    c.last_message_sender_id,
    COUNT(m.id) FILTER (WHERE m.sender_id != auth.uid() AND m.read_at IS NULL) as unread_count,
    COALESCE(
      CASE
        WHEN c.participant1_id = auth.uid() THEN uos2.is_online
        ELSE uos1.is_online
      END,
      FALSE
    ) as is_other_user_online
  FROM conversations c
  JOIN user_profiles up1 ON c.participant1_id = up1.id
  JOIN user_profiles up2 ON c.participant2_id = up2.id
  LEFT JOIN user_online_status uos1 ON c.participant1_id = uos1.user_id
  LEFT JOIN user_online_status uos2 ON c.participant2_id = uos2.user_id
  LEFT JOIN messages m ON c.id = m.conversation_id AND m.sender_id != auth.uid() AND m.read_at IS NULL
  WHERE c.participant1_id = auth.uid() OR c.participant2_id = auth.uid()
  GROUP BY c.id, up1.full_name, up1.user_type, up2.full_name, up2.user_type, uos1.is_online, uos2.is_online
  ORDER BY c.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(p_conversation_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE messages
  SET 
    status = 'read',
    read_at = NOW(),
    read_by = auth.uid()
  WHERE conversation_id = p_conversation_id
    AND sender_id != auth.uid()
    AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user online status
CREATE OR REPLACE FUNCTION update_online_status(p_is_online BOOLEAN)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_online_status (user_id, is_online, last_seen_at)
  VALUES (auth.uid(), p_is_online, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    is_online = p_is_online,
    last_seen_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set typing indicator
CREATE OR REPLACE FUNCTION set_typing_indicator(p_conversation_id UUID, p_is_typing BOOLEAN)
RETURNS VOID AS $$
BEGIN
  IF p_is_typing THEN
    -- Add or update typing indicator
    INSERT INTO typing_indicators (conversation_id, user_id, started_at)
    VALUES (p_conversation_id, auth.uid(), NOW())
    ON CONFLICT (id) DO UPDATE SET started_at = NOW();
  ELSE
    -- Remove typing indicator
    DELETE FROM typing_indicators
    WHERE conversation_id = p_conversation_id
      AND user_id = auth.uid();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION get_or_create_conversation(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_conversations() TO authenticated;
GRANT EXECUTE ON FUNCTION mark_messages_as_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_online_status(BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION set_typing_indicator(UUID, BOOLEAN) TO authenticated;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'MESSAGING SYSTEM CREATED SUCCESSFULLY!';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Created tables:';
  RAISE NOTICE '  - conversations';
  RAISE NOTICE '  - messages';
  RAISE NOTICE '  - typing_indicators';
  RAISE NOTICE '  - user_online_status';
  RAISE NOTICE '';
  RAISE NOTICE 'Created RPC functions:';
  RAISE NOTICE '  - get_or_create_conversation';
  RAISE NOTICE '  - get_my_conversations';
  RAISE NOTICE '  - mark_messages_as_read';
  RAISE NOTICE '  - update_online_status';
  RAISE NOTICE '  - set_typing_indicator';
  RAISE NOTICE '====================================================';
END $$;

