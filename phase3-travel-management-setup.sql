-- ============================================================================
-- WAVESYNC MARITIME PLATFORM - PHASE 3: TRAVEL MANAGEMENT SYSTEM
-- ============================================================================
-- This script creates the database schema for the travel and ticket management system

-- ============================================================================
-- STEP 1: CREATE ENUMS
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE travel_type AS ENUM (
      'sign_on', 'sign_off', 'leave', 'medical', 'emergency', 'shore_leave'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE travel_status AS ENUM (
      'pending', 'approved', 'booked', 'confirmed', 'in_progress', 'completed', 'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE flight_class AS ENUM (
      'economy', 'premium_economy', 'business', 'first'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE travel_document_type AS ENUM (
      'ticket', 'boarding_pass', 'visa', 'travel_permit', 'covid_certificate', 
      'insurance', 'itinerary', 'receipt', 'confirmation', 'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE expense_type AS ENUM (
      'accommodation', 'food', 'transportation', 'visa_fee', 'medical', 
      'communication', 'baggage', 'taxi', 'airport_transfer', 'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE expense_status AS ENUM (
      'pending', 'approved', 'rejected', 'reimbursed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- STEP 2: CREATE TRAVEL REQUESTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS travel_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seafarer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  
  -- Travel Details
  travel_type travel_type NOT NULL,
  request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  travel_date DATE NOT NULL,
  return_date DATE, -- Optional for round trips
  
  -- Origin and Destination
  origin_port VARCHAR(255),
  origin_city VARCHAR(255) NOT NULL,
  origin_country VARCHAR(100) NOT NULL,
  destination_port VARCHAR(255),
  destination_city VARCHAR(255) NOT NULL,
  destination_country VARCHAR(100) NOT NULL,
  
  -- Status
  status travel_status DEFAULT 'pending',
  priority assignment_priority DEFAULT 'normal',
  
  -- Additional Info
  notes TEXT,
  special_requirements TEXT,
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  
  -- Approval
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Audit
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: CREATE FLIGHT BOOKINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS flight_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_request_id UUID REFERENCES travel_requests(id) ON DELETE CASCADE NOT NULL,
  
  -- Booking Reference
  booking_reference VARCHAR(50),
  confirmation_number VARCHAR(50),
  
  -- Flight Details
  airline VARCHAR(100),
  airline_code VARCHAR(3),
  flight_number VARCHAR(20) NOT NULL,
  
  -- Schedule
  departure_date TIMESTAMP WITH TIME ZONE NOT NULL,
  arrival_date TIMESTAMP WITH TIME ZONE NOT NULL,
  departure_airport VARCHAR(10) NOT NULL, -- IATA code
  departure_terminal VARCHAR(10),
  arrival_airport VARCHAR(10) NOT NULL,   -- IATA code
  arrival_terminal VARCHAR(10),
  
  -- Booking Info
  seat_number VARCHAR(10),
  class flight_class DEFAULT 'economy',
  ticket_cost DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  baggage_allowance VARCHAR(50),
  meal_preference VARCHAR(50),
  
  -- Status
  status travel_status DEFAULT 'pending',
  
  -- E-ticket
  eticket_number VARCHAR(100),
  eticket_file_path TEXT,
  
  -- Audit
  booked_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 4: CREATE ACCOMMODATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_request_id UUID REFERENCES travel_requests(id) ON DELETE CASCADE NOT NULL,
  
  -- Hotel Details
  hotel_name VARCHAR(255) NOT NULL,
  hotel_address TEXT,
  hotel_city VARCHAR(255),
  hotel_country VARCHAR(100),
  hotel_phone VARCHAR(50),
  hotel_email VARCHAR(255),
  
  -- Booking Details
  booking_reference VARCHAR(100),
  confirmation_number VARCHAR(100),
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  room_type VARCHAR(100),
  number_of_nights INTEGER,
  
  -- Cost
  room_rate DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Status
  status travel_status DEFAULT 'pending',
  
  -- Additional Info
  special_requests TEXT,
  confirmation_file_path TEXT,
  
  -- Audit
  booked_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 5: CREATE TRAVEL DOCUMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS travel_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_request_id UUID REFERENCES travel_requests(id) ON DELETE CASCADE NOT NULL,
  seafarer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Document Details
  document_type travel_document_type NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(50),
  
  -- Metadata
  issue_date DATE,
  expiry_date DATE,
  document_number VARCHAR(100),
  issuing_authority VARCHAR(255),
  issuing_country VARCHAR(100),
  
  -- Status
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES user_profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  
  -- Audit
  uploaded_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 6: CREATE TRAVEL EXPENSES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS travel_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_request_id UUID REFERENCES travel_requests(id) ON DELETE CASCADE NOT NULL,
  seafarer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  
  -- Expense Details
  expense_type expense_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  expense_date DATE NOT NULL,
  description TEXT NOT NULL,
  vendor_name VARCHAR(255),
  
  -- Receipt
  receipt_file_path TEXT,
  receipt_number VARCHAR(100),
  
  -- Approval
  status expense_status DEFAULT 'pending',
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  approval_notes TEXT,
  rejected_reason TEXT,
  
  -- Reimbursement
  reimbursed_amount DECIMAL(10,2),
  reimbursed_at TIMESTAMP WITH TIME ZONE,
  reimbursement_reference VARCHAR(100),
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 7: CREATE INDEXES
-- ============================================================================

-- Travel Requests Indexes
CREATE INDEX IF NOT EXISTS idx_travel_requests_seafarer ON travel_requests(seafarer_id);
CREATE INDEX IF NOT EXISTS idx_travel_requests_company ON travel_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_travel_requests_assignment ON travel_requests(assignment_id);
CREATE INDEX IF NOT EXISTS idx_travel_requests_status ON travel_requests(status);
CREATE INDEX IF NOT EXISTS idx_travel_requests_date ON travel_requests(travel_date);
CREATE INDEX IF NOT EXISTS idx_travel_requests_type ON travel_requests(travel_type);

-- Flight Bookings Indexes
CREATE INDEX IF NOT EXISTS idx_flight_bookings_travel_request ON flight_bookings(travel_request_id);
CREATE INDEX IF NOT EXISTS idx_flight_bookings_departure ON flight_bookings(departure_date);
CREATE INDEX IF NOT EXISTS idx_flight_bookings_status ON flight_bookings(status);

-- Accommodations Indexes
CREATE INDEX IF NOT EXISTS idx_accommodations_travel_request ON accommodations(travel_request_id);
CREATE INDEX IF NOT EXISTS idx_accommodations_check_in ON accommodations(check_in_date);

-- Travel Documents Indexes
CREATE INDEX IF NOT EXISTS idx_travel_documents_travel_request ON travel_documents(travel_request_id);
CREATE INDEX IF NOT EXISTS idx_travel_documents_seafarer ON travel_documents(seafarer_id);
CREATE INDEX IF NOT EXISTS idx_travel_documents_type ON travel_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_travel_documents_expiry ON travel_documents(expiry_date);

-- Travel Expenses Indexes
CREATE INDEX IF NOT EXISTS idx_travel_expenses_travel_request ON travel_expenses(travel_request_id);
CREATE INDEX IF NOT EXISTS idx_travel_expenses_seafarer ON travel_expenses(seafarer_id);
CREATE INDEX IF NOT EXISTS idx_travel_expenses_company ON travel_expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_travel_expenses_status ON travel_expenses(status);

-- ============================================================================
-- STEP 8: CREATE RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE travel_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_expenses ENABLE ROW LEVEL SECURITY;

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

-- Similar policies for accommodations, travel_documents, and travel_expenses
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

-- ============================================================================
-- STEP 9: CREATE TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_travel_requests_updated_at ON travel_requests;
CREATE TRIGGER update_travel_requests_updated_at
    BEFORE UPDATE ON travel_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_flight_bookings_updated_at ON flight_bookings;
CREATE TRIGGER update_flight_bookings_updated_at
    BEFORE UPDATE ON flight_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_accommodations_updated_at ON accommodations;
CREATE TRIGGER update_accommodations_updated_at
    BEFORE UPDATE ON accommodations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_travel_documents_updated_at ON travel_documents;
CREATE TRIGGER update_travel_documents_updated_at
    BEFORE UPDATE ON travel_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_travel_expenses_updated_at ON travel_expenses;
CREATE TRIGGER update_travel_expenses_updated_at
    BEFORE UPDATE ON travel_expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 10: COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ TRAVEL MANAGEMENT SYSTEM SETUP COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Created:';
  RAISE NOTICE '  - 6 new enum types';
  RAISE NOTICE '  - 5 new tables (travel_requests, flight_bookings, accommodations, travel_documents, travel_expenses)';
  RAISE NOTICE '  - Multiple indexes for performance';
  RAISE NOTICE '  - Row Level Security policies';
  RAISE NOTICE '  - Auto-update triggers';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next Steps:';
  RAISE NOTICE '  1. Create TravelManagement UI component';
  RAISE NOTICE '  2. Create MyTravel UI for seafarers';
  RAISE NOTICE '  3. Add travel notification triggers';
  RAISE NOTICE '  4. Create storage bucket for travel documents';
  RAISE NOTICE '';
END $$;
