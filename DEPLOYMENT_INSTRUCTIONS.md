# 🚀 WaveSync Announcement System - Deployment Instructions

## ⚠️ IMPORTANT: Run Database Migration First!

The 404 errors you're seeing are because the RPC functions haven't been created yet.

### Step 1: Run SQL Migration

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Go to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste**
   - Open `broadcast-system-setup.sql` from your project
   - Copy ALL contents (648 lines)
   - Paste into the SQL Editor

4. **Run the Migration**
   - Click "RUN" button
   - Wait for confirmation message
   - Should see: "✅ Broadcast system setup complete!"

5. **Verify Installation**
   ```sql
   -- Run this to verify
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_name LIKE '%broadcast%';
   ```
   
   You should see:
   - get_my_broadcasts
   - mark_broadcast_as_read
   - acknowledge_broadcast
   - get_broadcast_analytics
   - get_broadcast_recipients
   - get_unread_broadcasts_count

### Step 2: Test the Functions

Run this in SQL Editor to test:
```sql
-- Test unread count (should return 0 for new installation)
SELECT get_unread_broadcasts_count();

-- Test get broadcasts (should return empty array)
SELECT * FROM get_my_broadcasts();
```

## After Migration

Once the migration is complete:
1. Refresh your browser
2. The 404 errors will disappear
3. Announcements system will work

## Troubleshooting

If you still see errors:
- Clear browser cache
- Check Supabase logs for any migration errors
- Verify you're connected to the correct database

