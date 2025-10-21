# 🚀 Quick Messaging Test Guide

## Test the Bidirectional Messaging System in 5 Minutes!

---

## 🎯 What You'll Test

1. ✅ Seafarer can start conversation with company user
2. ✅ Company user can start conversation with seafarer
3. ✅ Both can send messages back and forth
4. ✅ Real-time updates (via polling)
5. ✅ New conversation modal and contact selection

---

## 📋 Test Steps

### Step 1: Prepare Two Browser Windows

**Option A: Two Different Browsers**
- Window 1: Chrome (Seafarer)
- Window 2: Edge/Firefox (Company User)

**Option B: Regular + Incognito**
- Window 1: Regular Chrome (Seafarer)
- Window 2: Chrome Incognito (Company User)

---

### Step 2: Login as Seafarer (Window 1)

```
URL: http://localhost:5173/login
Email: seafarer1@wavesync.com
Password: seafarer123
```

1. Click **"Messages"** in the sidebar
2. You should see an empty messages page with a **"+"** button

---

### Step 3: Login as Company User (Window 2)

```
URL: http://localhost:5173/login
Email: company1@wavesync.com
Password: company123
```

1. Click **"Messages"** under the Administration section
2. You should see an empty messages page with a **"+"** button

---

### Step 4: Start Conversation from Seafarer Side

**In Window 1 (Seafarer):**

1. Click the **"+"** button (top right of sidebar)
2. A modal should open showing "Start New Conversation"
3. You should see a list of company users:
   - Marine Operations Manager (company)
   - Safety Compliance Officer (admin)
4. Type in the search box to filter contacts
5. Click on **"Marine Operations Manager"**
6. The modal closes and a new conversation opens
7. Type a message: **"Hello, can you confirm my next assignment?"**
8. Press Enter or click Send
9. Your message appears in the chat with a purple gradient background

**✅ Success Indicators:**
- Modal opened smoothly
- Contacts loaded
- Conversation created
- Message sent
- Message appears in chat

---

### Step 5: Check Company User Side

**In Window 2 (Company User):**

1. Wait **5 seconds** (for polling to refresh)
2. You should see a new conversation appear in the list:
   - Shows seafarer's name
   - Shows "1" unread badge (blue)
   - Shows message preview
   - Shows timestamp
3. Click on the conversation
4. You should see the seafarer's message
5. The unread badge disappears
6. Type a reply: **"Yes, you're assigned to MV Pacific Explorer. Details in your assignments."**
7. Press Enter to send

**✅ Success Indicators:**
- Conversation appeared automatically
- Unread badge visible
- Message visible when opened
- Reply sent successfully

---

### Step 6: Check Seafarer Side for Reply

**Back to Window 1 (Seafarer):**

1. Wait **3 seconds** (for message polling)
2. You should see the company user's reply appear
3. Your original message now shows **"• Read"** after the timestamp
4. Type another message: **"Great! When do I need to report?"**
5. Send it

**✅ Success Indicators:**
- Reply appeared automatically
- "Read" status visible
- Can continue conversation

---

### Step 7: Test New Conversation from Company Side

**In Window 2 (Company User):**

1. Click the **"+"** button
2. Modal opens with list of seafarers
3. Search for a seafarer name
4. Click on a different seafarer (not the one you're already chatting with)
5. Send a message: **"Your documents have been approved. Please check the document management page."**
6. Message sent successfully

**✅ Success Indicators:**
- Modal shows seafarers (not company users)
- Search works
- New conversation created
- Message sent

---

### Step 8: Test Multiple Conversations

**In Window 1 (Seafarer):**

1. Click the **"+"** button
2. Select a different company user (e.g., Safety Compliance Officer)
3. Send a message: **"Do I need to complete any safety training?"**
4. Go back to conversation list
5. You should see **two conversations** now
6. Click between them to switch

**✅ Success Indicators:**
- Multiple conversations visible
- Can switch between them
- Each maintains its own message history
- Unread counts update correctly

---

### Step 9: Test Online Status

**In both windows:**

1. Keep both users logged in
2. Both should show as **"Online"** in chat headers
3. In Window 2, log out
4. In Window 1, wait 5-10 seconds
5. The company user should now show as **"Offline"**

**✅ Success Indicators:**
- Green dot for online users
- "Online" text in header
- Status updates when user logs out

---

### Step 10: Test Search Functionality

**In Window 1 (Seafarer):**

1. In the Messages sidebar, use the search box
2. Type a contact name
3. Conversations should filter in real-time
4. Click **"+"** to open new conversation modal
5. Search for a contact in the modal
6. Contact list filters

**✅ Success Indicators:**
- Search works in conversation list
- Search works in contact modal
- Results update instantly

---

## 🎯 Expected Results Summary

| Test | Expected Result | Status |
|------|-----------------|--------|
| Seafarer can see company users in contacts | ✅ Yes | |
| Company user can see seafarers in contacts | ✅ Yes | |
| New conversation modal opens | ✅ Yes | |
| Contact search works | ✅ Yes | |
| Messages send successfully | ✅ Yes | |
| Messages appear for recipient (after 3-5s) | ✅ Yes | |
| Unread badges show | ✅ Yes | |
| Read receipts work | ✅ Yes | |
| Online status updates | ✅ Yes | |
| Multiple conversations work | ✅ Yes | |

---

## 🐛 Troubleshooting

### Issue: "No contacts found"
**Solution**: 
- Ensure both users have the same `company_id` in the database
- Check that user types are correct (seafarer vs company)

### Issue: Messages not appearing
**Solution**:
- Wait up to 5 seconds for polling
- Check browser console for errors
- Ensure you're logged in as the correct user

### Issue: "+" button not working
**Solution**:
- Check browser console for errors
- Ensure SQL functions are deployed (messaging-system-setup.sql)
- Refresh the page

### Issue: Modal not showing contacts
**Solution**:
- Check that fetchContacts is called (browser console)
- Verify company_id matches between users
- Ensure RLS policies are correct

---

## 📊 What to Look For

### Good Signs ✅
- Smooth animations when opening modal
- Contacts load within 1-2 seconds
- Messages appear within 3-5 seconds
- No console errors
- Unread badges update correctly
- Online status reflects actual state

### Warning Signs ⚠️
- Delays longer than 10 seconds
- Console errors
- 404 errors for RPC functions
- Contacts not loading
- Messages not sending

---

## 🎉 Success!

If all tests pass, you have a **fully functional bidirectional messaging system**!

### Next Steps:
1. Test with more users
2. Send longer messages
3. Test on mobile view (resize browser)
4. Test with slow network (Chrome DevTools throttling)
5. Add more test data

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Verify SQL setup: `messaging-system-setup.sql`
3. Check that both users have same `company_id`
4. Ensure proper user types (seafarer vs company)

---

## 🎯 Performance Notes

- **Conversation updates**: Every 5 seconds
- **Message updates**: Every 3 seconds (when chat open)
- **Contact search**: Instant (client-side)
- **Modal animations**: 0.2-0.3 seconds
- **Message send**: < 1 second

These intervals ensure a balance between real-time feel and server load.

---

*Happy Testing! 🚢💬*

---

*For detailed technical documentation, see: BIDIRECTIONAL_MESSAGING_COMPLETE.md*




