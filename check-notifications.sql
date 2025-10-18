-- Quick check: View all notifications for all users
SELECT 
  n.id,
  n.title,
  n.message,
  n.type,
  n.read,
  up.full_name as recipient,
  up.email,
  up.user_type,
  n.created_at
FROM notifications n
JOIN user_profiles up ON n.user_id = up.id
ORDER BY n.created_at DESC
LIMIT 20;

-- Check unread count per user
SELECT 
  up.full_name,
  up.email,
  up.user_type,
  COUNT(*) FILTER (WHERE n.read = false) as unread_count,
  COUNT(*) as total_notifications
FROM user_profiles up
LEFT JOIN notifications n ON n.user_id = up.id
GROUP BY up.id, up.full_name, up.email, up.user_type
ORDER BY unread_count DESC;
