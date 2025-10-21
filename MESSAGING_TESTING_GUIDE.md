# 🧪 Messaging System - Testing Guide

## 🎯 Quick Test Checklist

Use this guide to quickly test all messaging features.

---

## ✅ Step-by-Step Testing

### **Test 1: Setup Database** (One-time)

**Action:**
1. Open Supabase SQL Editor
2. Run `messaging-system-setup.sql`
3. Verify success message appears

**Expected Result:**
```
====================================================
MESSAGING SYSTEM CREATED SUCCESSFULLY!
====================================================
```

**Verify:**
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('conversations', 'messages', 'typing_indicators', 'user_online_status');

-- Should return 4 rows
```

---

### **Test 2: Enable Realtime** (One-time)

**Action:**
1. Go to Supabase Dashboard → Database → Replication
2. Enable replication for:
   - `conversations`
   - `messages`

**Expected Result:**
- Tables show "Replication enabled" ✅
- Green indicator next to table names

---

### **Test 3: Access Messages Page**

**Action:**
1. Login to WaveSync as company user
2. Click "Messages" in sidebar

**Expected Result:**
- Messages page loads
- Shows empty state: "No conversations yet"
- Search bar visible at top
- Clean, modern UI

**Screenshot locations:**
- Sidebar shows "Messages" with message icon
- Badge shows unread count (if any)

---

### **Test 4: Create Test Conversation**

**Option A: Via Database (Quick Test)**

Run this SQL to create a test conversation:

```sql
-- Get IDs
DO $$
DECLARE
  company_user UUID;
  seafarer_user UUID;
  conv_id UUID;
BEGIN
  -- Get a company user
  SELECT id INTO company_user 
  FROM user_profiles 
  WHERE user_type = 'company' 
  LIMIT 1;
  
  -- Get a seafarer
  SELECT id INTO seafarer_user 
  FROM user_profiles 
  WHERE user_type = 'seafarer' 
  LIMIT 1;
  
  RAISE NOTICE 'Company User: %', company_user;
  RAISE NOTICE 'Seafarer: %', seafarer_user;
  
  -- Create conversation
  INSERT INTO conversations (participant1_id, participant2_id)
  VALUES (
    LEAST(company_user, seafarer_user),
    GREATEST(company_user, seafarer_user)
  )
  RETURNING id INTO conv_id;
  
  -- Add some test messages
  INSERT INTO messages (conversation_id, sender_id, message_text, status)
  VALUES 
    (conv_id, company_user, 'Hello! Welcome aboard!', 'read'),
    (conv_id, seafarer_user, 'Thank you! Happy to be here.', 'read'),
    (conv_id, company_user, 'Your assignment starts next Monday.', 'sent');
  
  RAISE NOTICE '✅ Test conversation created with ID: %', conv_id;
END $$;
```

**Expected Result:**
- Console shows: "✅ Test conversation created"
- Refresh Messages page - conversation appears!

---

### **Test 5: View Conversation List**

**Action:**
1. Go to Messages page
2. Observe conversation list

**Expected Result:**
- ✅ Conversation(s) visible
- ✅ User avatar (initial)
- ✅ User name displayed
- ✅ User type shown (seafarer/company)
- ✅ Last message preview
- ✅ Timestamp shown
- ✅ Unread badge (if unread messages)
- ✅ Online status dot (if user online)

**Verify:**
- Conversations sorted by most recent
- Unread count badge is correct
- Last message preview matches database

---

### **Test 6: Open Conversation**

**Action:**
1. Click on a conversation in the list

**Expected Result:**
- ✅ Chat area opens on right
- ✅ User header shows name and status
- ✅ Messages load and display
- ✅ Messages sorted chronologically (oldest first)
- ✅ Own messages on right (purple gradient)
- ✅ Other messages on left (white)
- ✅ Timestamps visible
- ✅ Auto-scrolls to latest message
- ✅ Message input box at bottom

**Verify:**
- Selected conversation highlighted in list
- Messages match database records
- UI is smooth and responsive

---

### **Test 7: Send a Message**

**Action:**
1. Open a conversation
2. Type "Test message" in input box
3. Press Enter (or click Send)

**Expected Result:**
- ✅ Message appears instantly
- ✅ Message on right side (own message)
- ✅ Purple gradient background
- ✅ Timestamp shows current time
- ✅ Input box clears
- ✅ Auto-scrolls to new message
- ✅ Conversation list updates (last message changes)

**Verify in Database:**
```sql
SELECT * FROM messages 
ORDER BY created_at DESC 
LIMIT 1;

-- Should show your test message with correct sender_id
```

---

### **Test 8: Read Receipts**

**Action:**
1. Login as User A (company)
2. Send a message to User B (seafarer)
3. Note message shows timestamp only
4. Open another browser (or incognito)
5. Login as User B
6. Open the conversation
7. Switch back to User A's browser

**Expected Result:**
- ✅ User B sees unread badge (before opening)
- ✅ Badge disappears when User B opens conversation
- ✅ User A sees "Read" appear next to message
- ✅ `read_at` timestamp set in database

**Verify:**
```sql
SELECT message_text, read_at, read_by 
FROM messages 
WHERE conversation_id = 'YOUR-CONVERSATION-ID' 
ORDER BY created_at DESC;
```

---

### **Test 9: Real-time Updates**

**Action:**
1. Open Messages in Browser Window 1 (User A)
2. Open Messages in Browser Window 2 (User B)
3. Arrange windows side-by-side
4. Send message from Window 1
5. Observe Window 2

**Expected Result:**
- ✅ Message appears **instantly** in Window 2
- ✅ No page refresh needed
- ✅ Unread badge updates automatically
- ✅ Conversation list updates in real-time
- ✅ Smooth animation when message appears

**Verify:**
- Messages appear in < 1 second
- Both windows stay in sync
- No errors in console

---

### **Test 10: Online Status**

**Setup:**
1. Keep Browser Window 1 open (User A)
2. Open Browser Window 2 (User B)
3. Observe Window 1

**Expected Result:**
- ✅ User B shows green "Online" dot in Window 1
- ✅ Chat header shows "Online" status
- ✅ Conversation list shows online indicator

**Then:**
1. Close Window 2 (User B logs out)
2. Wait 30-60 seconds
3. Observe Window 1

**Expected Result:**
- ✅ Green dot disappears
- ✅ Status changes to "Offline"
- ✅ `last_seen_at` updated in database

**Verify:**
```sql
SELECT user_id, is_online, last_seen_at 
FROM user_online_status 
ORDER BY updated_at DESC;
```

---

### **Test 11: Search Conversations**

**Action:**
1. Go to Messages page
2. Type a user name in search box
3. Observe filtered results

**Expected Result:**
- ✅ Conversations filter in real-time
- ✅ Only matching users shown
- ✅ Search is case-insensitive
- ✅ Clears when search box emptied

**Test Cases:**
- Full name: "John Smith"
- Partial name: "Joh"
- Last name: "Smith"
- Empty search: shows all

---

### **Test 12: Multiple Messages**

**Action:**
1. Send 10+ messages quickly
2. Observe behavior

**Expected Result:**
- ✅ All messages send successfully
- ✅ Messages stay in order
- ✅ Auto-scroll works properly
- ✅ No duplicate messages
- ✅ Timestamps are correct
- ✅ Last message updates in list

---

### **Test 13: Long Messages**

**Action:**
1. Type a very long message (500+ characters)
2. Send it

**Expected Result:**
- ✅ Message sends successfully
- ✅ Text wraps properly in bubble
- ✅ Doesn't break UI
- ✅ Scrollable if needed
- ✅ Preview truncated in conversation list

---

### **Test 14: Special Characters**

**Action:**
Send messages with:
- Emojis: "Hello! 👋 🚢 ⚓"
- Line breaks: (press Shift+Enter)
- Symbols: "@#$%^&*()"
- URLs: "Check https://example.com"

**Expected Result:**
- ✅ All characters display correctly
- ✅ Line breaks preserved
- ✅ Emojis render properly
- ✅ No XSS vulnerabilities

---

### **Test 15: Keyboard Shortcuts**

**Action:**
1. Focus message input
2. Press Enter → should send
3. Press Shift+Enter → should create new line
4. Type and press Escape → (optional: could clear input)

**Expected Result:**
- ✅ Enter sends message
- ✅ Shift+Enter adds line break
- ✅ No conflicts with browser shortcuts

---

### **Test 16: Empty Message Validation**

**Action:**
1. Try to send empty message
2. Try to send only spaces

**Expected Result:**
- ✅ Send button disabled
- ✅ Nothing happens on Enter
- ✅ No empty messages in database
- ✅ Input validation works

---

### **Test 17: Concurrent Users**

**Action:**
1. Open 3+ browser windows
2. Login as different users
3. Send messages between users simultaneously

**Expected Result:**
- ✅ All messages deliver correctly
- ✅ No race conditions
- ✅ Each user sees correct conversations
- ✅ Unread counts accurate
- ✅ No message duplication

---

### **Test 18: Page Refresh**

**Action:**
1. Open a conversation
2. Send some messages
3. Refresh page (F5)

**Expected Result:**
- ✅ Returns to messages page
- ✅ Conversations still visible
- ✅ Can re-open conversation
- ✅ All messages still there
- ✅ Scroll position may reset (acceptable)

---

### **Test 19: Navigation**

**Action:**
1. Be in Messages page
2. Click another nav item (Dashboard, Tasks, etc.)
3. Return to Messages

**Expected Result:**
- ✅ Navigation works smoothly
- ✅ Returns to conversation list
- ✅ Previously opened conversation cleared
- ✅ New messages appear if any

---

### **Test 20: Mobile Responsive**

**Action:**
1. Open browser DevTools
2. Toggle device toolbar (mobile view)
3. Test different screen sizes

**Expected Result:**
- ✅ Layout adapts to screen size
- ✅ Conversation list responsive
- ✅ Messages readable on mobile
- ✅ Input box works on mobile
- ✅ Touch targets are adequate
- ✅ No horizontal scrolling

---

## 🐛 Common Issues & Fixes

### **Issue: Conversations not showing**

**Cause:** No conversations exist yet

**Fix:** 
- Run Test 4 to create test conversations
- Or wait for users to message each other

---

### **Issue: Messages don't appear in real-time**

**Cause:** Realtime not enabled

**Fix:**
1. Go to Supabase Dashboard
2. Database → Replication
3. Enable for `conversations` and `messages`

---

### **Issue: "Failed to load conversations" error**

**Cause:** RPC functions not created

**Fix:**
- Re-run `messaging-system-setup.sql`
- Verify functions exist:
  ```sql
  SELECT proname FROM pg_proc WHERE proname LIKE '%conversation%';
  ```

---

### **Issue: Online status always shows offline**

**Cause:** `update_online_status` not being called

**Fix:**
- Check browser console for errors
- Verify RPC function exists
- Check `user_online_status` table has entries

---

### **Issue: Unread count wrong**

**Cause:** `mark_messages_as_read` not called

**Fix:**
- Open conversation (should auto-mark)
- Verify RPC function works:
  ```sql
  SELECT mark_messages_as_read('conversation-id-here');
  ```

---

## ✅ Final Verification

Run this complete check:

```sql
-- 1. Check all tables exist
SELECT 'Tables' as check_type, COUNT(*) as count 
FROM information_schema.tables 
WHERE table_name IN ('conversations', 'messages', 'typing_indicators', 'user_online_status');
-- Should return 4

-- 2. Check RPC functions
SELECT 'Functions' as check_type, COUNT(*) as count 
FROM pg_proc 
WHERE proname IN (
  'get_or_create_conversation',
  'get_my_conversations',
  'mark_messages_as_read',
  'update_online_status',
  'set_typing_indicator'
);
-- Should return 5

-- 3. Check conversations
SELECT 'Conversations' as check_type, COUNT(*) as count 
FROM conversations;

-- 4. Check messages
SELECT 'Messages' as check_type, COUNT(*) as count 
FROM messages;

-- 5. Check RLS policies
SELECT 'RLS Policies' as check_type, COUNT(*) as count 
FROM pg_policies 
WHERE tablename IN ('conversations', 'messages', 'typing_indicators', 'user_online_status');
-- Should return 12
```

---

## 🎉 Success Criteria

Your messaging system is **fully functional** if:

✅ **All 20 tests pass**
✅ **SQL verification queries return expected counts**
✅ **No console errors**
✅ **Messages send and receive in < 1 second**
✅ **UI is responsive and smooth**
✅ **Read receipts work**
✅ **Online status updates**
✅ **Multiple users can chat simultaneously**

---

## 📊 Performance Benchmarks

**Expected Performance:**
- Message send time: < 500ms
- Message receive time: < 1000ms (real-time)
- Page load time: < 2 seconds
- Conversation switch: < 500ms
- Search filter: Instant (< 100ms)

---

## 🚀 Ready for Production!

If all tests pass, your messaging system is **production-ready**! 

Users can now:
- 💬 Chat in real-time
- 👀 See who's online
- ✅ Know when messages are read
- 🔍 Search conversations
- 📱 Use on mobile

**Happy chatting!** ⚓💬✨




