-- =====================================================
-- QUICK FIX: Drop and Recreate Travel RLS Policies
-- =====================================================
-- Use this script if you get "policy already exists" errors
-- This will NOT delete your data, only recreate the policies

-- =====================================================
-- STEP 1: DROP EXISTING POLICIES
-- =====================================================

-- Drop travel_requests policies
DROP POLICY IF EXISTS "Users can view their own travel requests" ON travel_requests;
DROP POLICY IF EXISTS "Company users can create travel requests" ON travel_requests;
DROP POLICY IF EXISTS "Company users can update their travel requests" ON travel_requests;
DROP POLICY IF EXISTS "Company users can delete their travel requests" ON travel_requests;

-- Drop flight_bookings policies
DROP POLICY IF EXISTS "Users can view related flight bookings" ON flight_bookings;
DROP POLICY IF EXISTS "Company users can manage flight bookings" ON flight_bookings;

-- Drop accommodations policies
DROP POLICY IF EXISTS "Users can view related accommodations" ON accommodations;
DROP POLICY IF EXISTS "Company users can manage accommodations" ON accommodations;

-- Drop travel_documents policies
DROP POLICY IF EXISTS "Users can view their travel documents" ON travel_documents;
DROP POLICY IF EXISTS "Users can upload their own travel documents" ON travel_documents;

-- Drop travel_expenses policies
DROP POLICY IF EXISTS "Users can view their travel expenses" ON travel_expenses;
DROP POLICY IF EXISTS "Seafarers can create their own travel expenses" ON travel_expenses;
DROP POLICY IF EXISTS "Company users can manage travel expenses" ON travel_expenses;

-- =====================================================
-- STEP 2: RECREATE RLS POLICIES
-- =====================================================

-- Travel Requests Policies
CREATE POLICY "Users can view their own travel requests"
  ON travel_requests FOR SELECT
  USING (
    seafarer_id = auth.uid() OR
    company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Company users can create travel requests"
  ON travel_requests FOR INSERT
  WITH CHECK (
    company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid() AND user_type IN ('admin', 'company'))
  );

CREATE POLICY "Company users can update their travel requests"
  ON travel_requests FOR UPDATE
  USING (
    company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid() AND user_type IN ('admin', 'company'))
  );

CREATE POLICY "Company users can delete their travel requests"
  ON travel_requests FOR DELETE
  USING (
    company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid() AND user_type IN ('admin', 'company'))
  );

-- Flight Bookings Policies
CREATE POLICY "Users can view related flight bookings"
  ON flight_bookings FOR SELECT
  USING (
    travel_request_id IN (
      SELECT id FROM travel_requests WHERE 
        seafarer_id = auth.uid() OR
        company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Company users can manage flight bookings"
  ON flight_bookings FOR ALL
  USING (
    travel_request_id IN (
      SELECT id FROM travel_requests WHERE 
        company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid() AND user_type IN ('admin', 'company'))
    )
  );

-- Accommodations Policies
CREATE POLICY "Users can view related accommodations"
  ON accommodations FOR SELECT
  USING (
    travel_request_id IN (
      SELECT id FROM travel_requests WHERE 
        seafarer_id = auth.uid() OR
        company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Company users can manage accommodations"
  ON accommodations FOR ALL
  USING (
    travel_request_id IN (
      SELECT id FROM travel_requests WHERE 
        company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid() AND user_type IN ('admin', 'company'))
    )
  );

-- Travel Documents Policies
CREATE POLICY "Users can view their travel documents"
  ON travel_documents FOR SELECT
  USING (
    seafarer_id = auth.uid() OR
    travel_request_id IN (
      SELECT id FROM travel_requests WHERE 
        company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can upload their own travel documents"
  ON travel_documents FOR INSERT
  WITH CHECK (
    seafarer_id = auth.uid() OR
    travel_request_id IN (
      SELECT id FROM travel_requests WHERE 
        company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid() AND user_type IN ('admin', 'company'))
    )
  );

-- Travel Expenses Policies
CREATE POLICY "Users can view their travel expenses"
  ON travel_expenses FOR SELECT
  USING (
    seafarer_id = auth.uid() OR
    company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Seafarers can create their own travel expenses"
  ON travel_expenses FOR INSERT
  WITH CHECK (seafarer_id = auth.uid());

CREATE POLICY "Company users can manage travel expenses"
  ON travel_expenses FOR UPDATE
  USING (
    company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid() AND user_type IN ('admin', 'company'))
  );

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ RLS policies recreated successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Policies Created:';
  RAISE NOTICE '  - Travel Requests: 4 policies';
  RAISE NOTICE '  - Flight Bookings: 2 policies';
  RAISE NOTICE '  - Accommodations: 2 policies';
  RAISE NOTICE '  - Travel Documents: 2 policies';
  RAISE NOTICE '  - Travel Expenses: 3 policies';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next Steps:';
  RAISE NOTICE '  1. Verify policies: SELECT * FROM pg_policies WHERE tablename LIKE ''%travel%'';';
  RAISE NOTICE '  2. Test the Travel Management UI';
  RAISE NOTICE '';
END $$;

