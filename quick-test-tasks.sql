-- ============================================================================
-- QUICK TASK MANAGEMENT TESTING
-- ============================================================================
-- This script creates sample tasks for testing the task management system
-- Run this in the Supabase SQL Editor after the main setup

-- ============================================================================
-- Step 1: Get User IDs (Update these with your actual user IDs)
-- ============================================================================

-- Find a company user (task creator)
-- SELECT id, email, full_name FROM user_profiles WHERE user_type = 'company' LIMIT 1;

-- Find a seafarer (task assignee)
-- SELECT id, email, full_name FROM user_profiles WHERE user_type = 'seafarer' LIMIT 1;

-- ============================================================================
-- Step 2: Insert Test Tasks
-- Replace the UUIDs below with actual user IDs from Step 1
-- ============================================================================

-- IMPORTANT: Replace these with your actual user IDs!
DO $$
DECLARE
    company_user_id UUID;
    seafarer_user_id UUID;
    company_id_value UUID;
BEGIN
    -- Get a company user
    SELECT id, company_id INTO company_user_id, company_id_value
    FROM user_profiles 
    WHERE user_type = 'company' 
    LIMIT 1;
    
    -- Get a seafarer
    SELECT id INTO seafarer_user_id 
    FROM user_profiles 
    WHERE user_type = 'seafarer' 
    LIMIT 1;
    
    -- Check if users were found
    IF company_user_id IS NULL THEN
        RAISE EXCEPTION 'No company user found. Please create a company user first.';
    END IF;
    
    IF seafarer_user_id IS NULL THEN
        RAISE EXCEPTION 'No seafarer found. Please create a seafarer first.';
    END IF;
    
    IF company_id_value IS NULL THEN
        RAISE EXCEPTION 'Company user has no company_id. Please ensure company user is properly set up.';
    END IF;
    
    -- Insert test tasks
    INSERT INTO tasks (
        title, 
        description, 
        category, 
        priority, 
        status,
        company_id,
        assigned_to, 
        assigned_by,
        due_date
    ) VALUES
    -- High Priority - Urgent Document Upload Task
    (
        'Complete STCW Certificate Renewal',
        'Your STCW certificate is expiring soon. Please renew it before the due date to maintain compliance.',
        'document_upload',
        'high',
        'pending',
        company_id_value,
        seafarer_user_id,
        company_user_id,
        NOW() + INTERVAL '7 days'
    ),
    
    -- Medium Priority - Training Task
    (
        'Complete Safety Training Module',
        'Complete the online safety training module before your next assignment. This includes fire safety, personal survival, and first aid.',
        'training',
        'medium',
        'pending',
        company_id_value,
        seafarer_user_id,
        company_user_id,
        NOW() + INTERVAL '14 days'
    ),
    
    -- High Priority - Medical Task
    (
        'Medical Examination Required',
        'Schedule and complete your annual medical examination with an approved medical practitioner.',
        'medical',
        'high',
        'pending',
        company_id_value,
        seafarer_user_id,
        company_user_id,
        NOW() + INTERVAL '10 days'
    ),
    
    -- Low Priority - Compliance Task
    (
        'Update Emergency Contact Information',
        'Please review and update your emergency contact information in the crew management system.',
        'compliance',
        'low',
        'pending',
        company_id_value,
        seafarer_user_id,
        company_user_id,
        NOW() + INTERVAL '30 days'
    ),
    
    -- Urgent Priority - Due Tomorrow Task
    (
        'Submit Vessel Inspection Report',
        'The weekly vessel inspection report is due tomorrow. Please submit it immediately.',
        'compliance',
        'urgent',
        'pending',
        company_id_value,
        seafarer_user_id,
        company_user_id,
        NOW() + INTERVAL '1 day'
    ),
    
    -- In Progress Task
    (
        'Review Company Policies',
        'Review the updated company policies and sign the acknowledgment form.',
        'compliance',
        'medium',
        'in_progress',
        company_id_value,
        seafarer_user_id,
        company_user_id,
        NOW() + INTERVAL '5 days'
    ),
    
    -- Completed Task
    (
        'Complete Onboarding Checklist',
        'Complete all items in the onboarding checklist including uniform collection and ID card pickup.',
        'onboarding',
        'medium',
        'completed',
        company_id_value,
        seafarer_user_id,
        company_user_id,
        NOW() + INTERVAL '3 days'
    );
    
    RAISE NOTICE 'Successfully created 7 test tasks!';
    RAISE NOTICE 'Company User ID: %', company_user_id;
    RAISE NOTICE 'Seafarer ID: %', seafarer_user_id;
    RAISE NOTICE 'Company ID: %', company_id_value;
END $$;

-- ============================================================================
-- Step 3: Verify Test Tasks
-- ============================================================================

-- View all test tasks
SELECT 
    t.title,
    t.category,
    t.priority,
    t.status,
    t.due_date,
    up.full_name as assigned_to
FROM tasks t
LEFT JOIN user_profiles up ON t.assigned_to = up.id
ORDER BY t.created_at DESC
LIMIT 10;

-- Check task counts by status
SELECT 
    status,
    COUNT(*) as count
FROM tasks
GROUP BY status
ORDER BY status;

-- Check notifications created (task-related)
SELECT 
    type,
    title,
    message,
    created_at
FROM notifications
WHERE title ILIKE '%task%' 
   OR message ILIKE '%task%'
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- QUICK CLEANUP (Optional - Use this to remove test data)
-- ============================================================================

-- Uncomment to delete all tasks (use with caution!)
-- DELETE FROM tasks WHERE created_at > NOW() - INTERVAL '1 hour';

-- Uncomment to delete task notifications
-- DELETE FROM notifications 
-- WHERE (title ILIKE '%task%' OR message ILIKE '%task%') 
-- AND created_at > NOW() - INTERVAL '1 hour';

