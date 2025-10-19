-- =====================================================
-- TRAVEL MANAGEMENT NOTIFICATION SYSTEM
-- =====================================================
-- This script adds notification triggers for travel management events
-- Run this after setting up the travel management tables and notification system

-- =====================================================
-- 1. NOTIFICATION TEMPLATES FOR TRAVEL EVENTS
-- =====================================================

-- Travel Request Created
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM notification_templates WHERE name = 'travel_request_created') THEN
    INSERT INTO notification_templates (name, subject, template, type, variables, is_active, created_at) 
    VALUES (
      'travel_request_created',
      'New Travel Request Created',
      'A travel request has been created for {{travel_type}} to {{destination}}. Travel date: {{travel_date}}.',
      'info',
      '["travel_type", "destination", "travel_date"]'::jsonb,
      true,
      NOW()
    );
  END IF;
END $$;

-- Travel Request Approved
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM notification_templates WHERE name = 'travel_request_approved') THEN
    INSERT INTO notification_templates (name, subject, template, type, variables, is_active, created_at) 
    VALUES (
      'travel_request_approved',
      'Travel Request Approved',
      'Your {{travel_type}} travel request to {{destination}} has been approved. Travel date: {{travel_date}}.',
      'success',
      '["travel_type", "destination", "travel_date"]'::jsonb,
      true,
      NOW()
    );
  END IF;
END $$;

-- Travel Booked
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM notification_templates WHERE name = 'travel_booked') THEN
    INSERT INTO notification_templates (name, subject, template, type, variables, is_active, created_at) 
    VALUES (
      'travel_booked',
      'Travel Arrangements Booked',
      'Your travel to {{destination}} has been booked. Please check your travel itinerary for details.',
      'success',
      '["destination"]'::jsonb,
      true,
      NOW()
    );
  END IF;
END $$;

-- Travel Confirmed
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM notification_templates WHERE name = 'travel_confirmed') THEN
    INSERT INTO notification_templates (name, subject, template, type, variables, is_active, created_at) 
    VALUES (
      'travel_confirmed',
      'Travel Confirmed',
      'Your travel arrangements to {{destination}} have been confirmed. Travel date: {{travel_date}}.',
      'success',
      '["destination", "travel_date"]'::jsonb,
      true,
      NOW()
    );
  END IF;
END $$;

-- Travel Reminder (7 days before)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM notification_templates WHERE name = 'travel_reminder_7days') THEN
    INSERT INTO notification_templates (name, subject, template, type, variables, is_active, created_at) 
    VALUES (
      'travel_reminder_7days',
      'Travel Reminder - 7 Days',
      'Reminder: Your travel to {{destination}} is in 7 days ({{travel_date}}). Please ensure all documents are ready.',
      'warning',
      '["destination", "travel_date"]'::jsonb,
      true,
      NOW()
    );
  END IF;
END $$;

-- Travel Reminder (24 hours before)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM notification_templates WHERE name = 'travel_reminder_24hrs') THEN
    INSERT INTO notification_templates (name, subject, template, type, variables, is_active, created_at) 
    VALUES (
      'travel_reminder_24hrs',
      'Travel Reminder - Tomorrow',
      'Reminder: Your travel to {{destination}} is tomorrow ({{travel_date}}). Please be prepared and check your itinerary.',
      'warning',
      '["destination", "travel_date"]'::jsonb,
      true,
      NOW()
    );
  END IF;
END $$;

-- Travel Cancelled
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM notification_templates WHERE name = 'travel_cancelled') THEN
    INSERT INTO notification_templates (name, subject, template, type, variables, is_active, created_at) 
    VALUES (
      'travel_cancelled',
      'Travel Cancelled',
      'Your travel to {{destination}} scheduled for {{travel_date}} has been cancelled.',
      'error',
      '["destination", "travel_date"]'::jsonb,
      true,
      NOW()
    );
  END IF;
END $$;

-- Flight Booking Added
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM notification_templates WHERE name = 'flight_booking_added') THEN
    INSERT INTO notification_templates (name, subject, template, type, variables, is_active, created_at) 
    VALUES (
      'flight_booking_added',
      'Flight Details Added',
      'Flight details have been added to your travel itinerary. {{airline}} {{flight_number}}, departing {{departure_date}}.',
      'info',
      '["airline", "flight_number", "departure_date"]'::jsonb,
      true,
      NOW()
    );
  END IF;
END $$;

-- =====================================================
-- 2. TRIGGER FUNCTION FOR TRAVEL REQUESTS
-- =====================================================

CREATE OR REPLACE FUNCTION handle_travel_request_notifications()
RETURNS TRIGGER AS $$
DECLARE
  v_travel_type_display TEXT;
  v_destination TEXT;
  v_travel_date TEXT;
BEGIN
  -- Format travel type for display
  v_travel_type_display := REPLACE(REPLACE(NEW.travel_type::TEXT, '_', ' '), 'sign on', 'Sign On');
  v_destination := NEW.destination_city || ', ' || NEW.destination_country;
  v_travel_date := TO_CHAR(NEW.travel_date, 'Mon DD, YYYY');

  -- Handle INSERT (new travel request)
  IF TG_OP = 'INSERT' THEN
    -- Notify seafarer about new travel request
    PERFORM create_notification(
      NEW.seafarer_id,
      'New Travel Request Created',
      'A ' || v_travel_type_display || ' travel request has been created for you to ' || v_destination || '. Travel date: ' || v_travel_date || '.',
      'info'
    );

    -- Notify company users about new travel request
    PERFORM create_company_notification(
      NEW.company_id,
      'New Travel Request',
      'A new ' || v_travel_type_display || ' travel request has been created for travel to ' || v_destination || ' on ' || v_travel_date || '.',
      'info'
    );

  -- Handle UPDATE (status change)
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    
    -- Travel Approved
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
      PERFORM create_notification(
        NEW.seafarer_id,
        'Travel Request Approved',
        'Your ' || v_travel_type_display || ' travel request to ' || v_destination || ' has been approved. Travel date: ' || v_travel_date || '.',
        'success'
      );
    
    -- Travel Booked
    ELSIF NEW.status = 'booked' AND OLD.status IN ('approved', 'pending') THEN
      PERFORM create_notification(
        NEW.seafarer_id,
        'Travel Arrangements Booked',
        'Your travel to ' || v_destination || ' has been booked. Please check your travel itinerary for details.',
        'success'
      );
    
    -- Travel Confirmed
    ELSIF NEW.status = 'confirmed' AND OLD.status = 'booked' THEN
      PERFORM create_notification(
        NEW.seafarer_id,
        'Travel Confirmed',
        'Your travel arrangements to ' || v_destination || ' have been confirmed. Travel date: ' || v_travel_date || '.',
        'success'
      );
    
    -- Travel In Progress
    ELSIF NEW.status = 'in_progress' AND OLD.status = 'confirmed' THEN
      PERFORM create_notification(
        NEW.seafarer_id,
        'Safe Travels',
        'Your travel to ' || v_destination || ' is now in progress. Have a safe journey!',
        'info'
      );
    
    -- Travel Completed
    ELSIF NEW.status = 'completed' AND OLD.status = 'in_progress' THEN
      PERFORM create_notification(
        NEW.seafarer_id,
        'Travel Completed',
        'Your travel to ' || v_destination || ' has been marked as completed. We hope you had a safe journey.',
        'success'
      );
      
      -- Notify company about completed travel
      PERFORM create_company_notification(
        NEW.company_id,
        'Travel Completed',
        'Travel to ' || v_destination || ' has been completed.',
        'info'
      );
    
    -- Travel Cancelled
    ELSIF NEW.status = 'cancelled' THEN
      PERFORM create_notification(
        NEW.seafarer_id,
        'Travel Cancelled',
        'Your travel to ' || v_destination || ' scheduled for ' || v_travel_date || ' has been cancelled.',
        'error'
      );
      
      -- Notify company about cancelled travel
      PERFORM create_company_notification(
        NEW.company_id,
        'Travel Cancelled',
        'Travel to ' || v_destination || ' scheduled for ' || v_travel_date || ' has been cancelled.',
        'warning'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS travel_request_notification_trigger ON travel_requests;
CREATE TRIGGER travel_request_notification_trigger
  AFTER INSERT OR UPDATE ON travel_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_travel_request_notifications();

-- =====================================================
-- 3. TRIGGER FUNCTION FOR FLIGHT BOOKINGS
-- =====================================================

CREATE OR REPLACE FUNCTION handle_flight_booking_notifications()
RETURNS TRIGGER AS $$
DECLARE
  v_travel_request RECORD;
  v_departure_date TEXT;
BEGIN
  -- Get the related travel request
  SELECT seafarer_id, destination_city, destination_country 
  INTO v_travel_request
  FROM travel_requests 
  WHERE id = NEW.travel_request_id;

  v_departure_date := TO_CHAR(NEW.departure_date, 'Mon DD, YYYY at HH24:MI');

  -- Notify seafarer about new flight booking
  IF TG_OP = 'INSERT' THEN
    PERFORM create_notification(
      v_travel_request.seafarer_id,
      'Flight Details Added',
      'Flight details have been added to your travel itinerary. ' || NEW.airline || ' ' || NEW.flight_number || ', departing ' || v_departure_date || '.',
      'info'
    );
  
  -- Notify seafarer about flight booking update
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM create_notification(
      v_travel_request.seafarer_id,
      'Flight Details Updated',
      'Your flight details have been updated. ' || NEW.airline || ' ' || NEW.flight_number || ', departing ' || v_departure_date || '.',
      'warning'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS flight_booking_notification_trigger ON flight_bookings;
CREATE TRIGGER flight_booking_notification_trigger
  AFTER INSERT OR UPDATE ON flight_bookings
  FOR EACH ROW
  EXECUTE FUNCTION handle_flight_booking_notifications();

-- =====================================================
-- 4. TRIGGER FUNCTION FOR ACCOMMODATIONS
-- =====================================================

CREATE OR REPLACE FUNCTION handle_accommodation_notifications()
RETURNS TRIGGER AS $$
DECLARE
  v_travel_request RECORD;
  v_checkin_date TEXT;
BEGIN
  -- Get the related travel request
  SELECT seafarer_id 
  INTO v_travel_request
  FROM travel_requests 
  WHERE id = NEW.travel_request_id;

  v_checkin_date := TO_CHAR(NEW.checkin_date, 'Mon DD, YYYY');

  -- Notify seafarer about new accommodation
  IF TG_OP = 'INSERT' THEN
    PERFORM create_notification(
      v_travel_request.seafarer_id,
      'Accommodation Booked',
      'Your accommodation has been booked at ' || NEW.hotel_name || ' (' || NEW.city || ', ' || NEW.country || '). Check-in: ' || v_checkin_date || '.',
      'info'
    );
  
  -- Notify seafarer about accommodation update
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM create_notification(
      v_travel_request.seafarer_id,
      'Accommodation Updated',
      'Your accommodation details have been updated. ' || NEW.hotel_name || ' (' || NEW.city || ', ' || NEW.country || ').',
      'warning'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS accommodation_notification_trigger ON accommodations;
CREATE TRIGGER accommodation_notification_trigger
  AFTER INSERT OR UPDATE ON accommodations
  FOR EACH ROW
  EXECUTE FUNCTION handle_accommodation_notifications();

-- =====================================================
-- 5. FUNCTION TO SEND TRAVEL REMINDERS (Manual/Scheduled)
-- =====================================================

CREATE OR REPLACE FUNCTION send_travel_reminders()
RETURNS void AS $$
DECLARE
  v_travel RECORD;
  v_destination TEXT;
  v_travel_date TEXT;
  v_days_until INTEGER;
BEGIN
  -- Find all confirmed upcoming travels
  FOR v_travel IN 
    SELECT 
      tr.id,
      tr.seafarer_id,
      tr.travel_date,
      tr.destination_city,
      tr.destination_country,
      tr.travel_type,
      EXTRACT(DAY FROM (tr.travel_date - CURRENT_DATE))::INTEGER as days_until
    FROM travel_requests tr
    WHERE tr.status IN ('confirmed', 'booked')
      AND tr.travel_date > CURRENT_DATE
      AND tr.travel_date <= CURRENT_DATE + INTERVAL '7 days'
  LOOP
    v_destination := v_travel.destination_city || ', ' || v_travel.destination_country;
    v_travel_date := TO_CHAR(v_travel.travel_date, 'Mon DD, YYYY');
    v_days_until := v_travel.days_until;

    -- Send 7-day reminder
    IF v_days_until = 7 THEN
      PERFORM create_notification(
        v_travel.seafarer_id,
        'Travel Reminder - 7 Days',
        'Reminder: Your travel to ' || v_destination || ' is in 7 days (' || v_travel_date || '). Please ensure all documents are ready.',
        'warning'
      );
    
    -- Send 24-hour reminder
    ELSIF v_days_until = 1 THEN
      PERFORM create_notification(
        v_travel.seafarer_id,
        'Travel Reminder - Tomorrow',
        'Reminder: Your travel to ' || v_destination || ' is tomorrow (' || v_travel_date || '). Please be prepared and check your itinerary.',
        'warning'
      );
    
    -- Send same-day reminder
    ELSIF v_days_until = 0 THEN
      PERFORM create_notification(
        v_travel.seafarer_id,
        'Travel Today',
        'Your travel to ' || v_destination || ' is today! Safe travels.',
        'warning'
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. TEST THE NOTIFICATION SYSTEM
-- =====================================================

-- To manually trigger travel reminders, run:
-- SELECT send_travel_reminders();

-- To schedule this function to run daily, you would typically use:
-- 1. Supabase Edge Functions with cron
-- 2. External cron job calling a PostgreSQL function
-- 3. pg_cron extension (if available)

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE ' ';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'TRAVEL NOTIFICATION SYSTEM SETUP COMPLETE!';
  RAISE NOTICE '====================================================';
  RAISE NOTICE ' ';
  RAISE NOTICE 'Summary:';
  RAISE NOTICE '  - 8 notification templates created';
  RAISE NOTICE '  - 3 notification triggers created';
  RAISE NOTICE '  - 1 reminder function created';
  RAISE NOTICE ' ';
  RAISE NOTICE 'To test:';
  RAISE NOTICE '  1. Create a new travel request';
  RAISE NOTICE '  2. Update travel status';
  RAISE NOTICE '  3. Add flight booking details';
  RAISE NOTICE '  4. Add accommodation details';
  RAISE NOTICE '  5. Check notifications in the app';
  RAISE NOTICE ' ';
  RAISE NOTICE 'To enable travel reminders:';
  RAISE NOTICE '  - Set up cron: SELECT send_travel_reminders();';
  RAISE NOTICE '  - Recommended: Run daily at 8:00 AM';
  RAISE NOTICE ' ';
END $$;

