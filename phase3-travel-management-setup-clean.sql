-- =====================================================
-- TRAVEL MANAGEMENT SYSTEM - CLEAN SETUP
-- =====================================================
-- This version drops existing objects before creating them
-- Run this if you need to re-run the setup script

-- =====================================================
-- STEP 1: DROP EXISTING POLICIES (IF ANY)
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
-- STEP 2: DROP EXISTING TABLES (IF NEEDED)
-- =====================================================
-- Uncomment these if you need to completely reset the tables

-- DROP TABLE IF EXISTS travel_expenses CASCADE;
-- DROP TABLE IF EXISTS travel_documents CASCADE;
-- DROP TABLE IF EXISTS accommodations CASCADE;
-- DROP TABLE IF EXISTS flight_bookings CASCADE;
-- DROP TABLE IF EXISTS travel_requests CASCADE;

-- =====================================================
-- STEP 3: DROP AND RECREATE ENUMS
-- =====================================================

DROP TYPE IF EXISTS travel_type CASCADE;
CREATE TYPE travel_type AS ENUM (
  'sign_on',
  'sign_off',
  'leave',
  'medical',
  'emergency',
  'shore_leave'
);

DROP TYPE IF EXISTS travel_status CASCADE;
CREATE TYPE travel_status AS ENUM (
  'pending',
  'approved',
  'booked',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled'
);

DROP TYPE IF EXISTS flight_class CASCADE;
CREATE TYPE flight_class AS ENUM (
  'economy',
  'premium_economy',
  'business',
  'first'
);

DROP TYPE IF EXISTS travel_document_type CASCADE;
CREATE TYPE travel_document_type AS ENUM (
  'e_ticket',
  'boarding_pass',
  'hotel_confirmation',
  'visa',
  'insurance',
  'itinerary',
  'receipt',
  'other'
);

DROP TYPE IF EXISTS expense_type CASCADE;
CREATE TYPE expense_type AS ENUM (
  'flight',
  'accommodation',
  'meals',
  'transportation',
  'visa',
  'insurance',
  'medical',
  'other'
);

DROP TYPE IF EXISTS expense_status CASCADE;
CREATE TYPE expense_status AS ENUM (
  'pending',
  'approved',
  'paid',
  'rejected'
);

-- =====================================================
-- STEP 4: CREATE TABLES
-- =====================================================

-- Travel Requests Table
CREATE TABLE IF NOT EXISTS travel_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seafarer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
  
  -- Travel Details
  title VARCHAR(255),
  travel_type travel_type NOT NULL,
  travel_date DATE NOT NULL,
  return_date DATE,
  
  -- Origin
  origin_city VARCHAR(255) NOT NULL,
  origin_country VARCHAR(100) NOT NULL,
  origin_airport VARCHAR(10),
  
  -- Destination
  destination_city VARCHAR(255) NOT NULL,
  destination_country VARCHAR(100) NOT NULL,
  destination_airport VARCHAR(10),
  
  -- Status & Priority
  status travel_status DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'normal',
  
  -- Cost
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Additional Info
  notes TEXT,
  special_requirements TEXT,
  
  -- Audit
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flight Bookings Table
CREATE TABLE IF NOT EXISTS flight_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_request_id UUID REFERENCES travel_requests(id) ON DELETE CASCADE NOT NULL,
  
  -- Flight Details
  airline VARCHAR(100) NOT NULL,
  flight_number VARCHAR(20) NOT NULL,
  departure_date TIMESTAMP WITH TIME ZONE NOT NULL,
  arrival_date TIMESTAMP WITH TIME ZONE NOT NULL,
  departure_airport VARCHAR(10) NOT NULL,
  arrival_airport VARCHAR(10) NOT NULL,
  
  -- Seat & Class
  seat_number VARCHAR(10),
  class flight_class DEFAULT 'economy',
  
  -- Booking Details
  booking_reference VARCHAR(100),
  pnr VARCHAR(50),
  e_ticket_number VARCHAR(50),
  ticket_file_path TEXT,
  
  -- Cost
  ticket_cost DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Status
  status travel_status DEFAULT 'booked',
  
  -- Additional Info
  baggage_allowance VARCHAR(50),
  meal_preference VARCHAR(50),
  notes TEXT,
  
  -- Audit
  booked_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accommodations Table
CREATE TABLE IF NOT EXISTS accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_request_id UUID REFERENCES travel_requests(id) ON DELETE CASCADE NOT NULL,
  
  -- Hotel Details
  hotel_name VARCHAR(255) NOT NULL,
  hotel_address TEXT,
  city VARCHAR(255),
  country VARCHAR(100),
  hotel_phone VARCHAR(50),
  hotel_email VARCHAR(255),
  
  -- Booking Details
  booking_reference VARCHAR(100),
  confirmation_number VARCHAR(100),
  checkin_date DATE NOT NULL,
  checkout_date DATE NOT NULL,
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

-- Travel Documents Table
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

-- Travel Expenses Table
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
  
  -- Description
  description TEXT,
  merchant_name VARCHAR(255),
  location VARCHAR(255),
  
  -- Receipt
  receipt_file_path TEXT,
  receipt_number VARCHAR(100),
  
  -- Status
  status expense_status DEFAULT 'pending',
  
  -- Approval
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  approval_notes TEXT,
  
  -- Reimbursement
  reimbursed BOOLEAN DEFAULT false,
  reimbursement_date DATE,
  reimbursement_method VARCHAR(50),
  reimbursement_reference VARCHAR(100),
  
  -- Audit
  submitted_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE travel_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_expenses ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 6: CREATE RLS POLICIES
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
-- STEP 7: CREATE INDEXES
-- =====================================================

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_travel_requests_seafarer;
DROP INDEX IF EXISTS idx_travel_requests_company;
DROP INDEX IF EXISTS idx_travel_requests_assignment;
DROP INDEX IF EXISTS idx_travel_requests_status;
DROP INDEX IF EXISTS idx_travel_requests_travel_date;
DROP INDEX IF EXISTS idx_flight_bookings_travel_request;
DROP INDEX IF EXISTS idx_accommodations_travel_request;
DROP INDEX IF EXISTS idx_travel_documents_travel_request;
DROP INDEX IF EXISTS idx_travel_documents_seafarer;
DROP INDEX IF EXISTS idx_travel_expenses_travel_request;
DROP INDEX IF EXISTS idx_travel_expenses_seafarer;
DROP INDEX IF EXISTS idx_travel_expenses_status;

-- Create new indexes
CREATE INDEX idx_travel_requests_seafarer ON travel_requests(seafarer_id);
CREATE INDEX idx_travel_requests_company ON travel_requests(company_id);
CREATE INDEX idx_travel_requests_assignment ON travel_requests(assignment_id);
CREATE INDEX idx_travel_requests_status ON travel_requests(status);
CREATE INDEX idx_travel_requests_travel_date ON travel_requests(travel_date);

CREATE INDEX idx_flight_bookings_travel_request ON flight_bookings(travel_request_id);
CREATE INDEX idx_accommodations_travel_request ON accommodations(travel_request_id);
CREATE INDEX idx_travel_documents_travel_request ON travel_documents(travel_request_id);
CREATE INDEX idx_travel_documents_seafarer ON travel_documents(seafarer_id);
CREATE INDEX idx_travel_expenses_travel_request ON travel_expenses(travel_request_id);
CREATE INDEX idx_travel_expenses_seafarer ON travel_expenses(seafarer_id);
CREATE INDEX idx_travel_expenses_status ON travel_expenses(status);

-- =====================================================
-- STEP 8: CREATE UPDATE TRIGGERS
-- =====================================================

-- Drop existing trigger function and triggers
DROP TRIGGER IF EXISTS set_travel_requests_updated_at ON travel_requests;
DROP TRIGGER IF EXISTS set_flight_bookings_updated_at ON flight_bookings;
DROP TRIGGER IF EXISTS set_accommodations_updated_at ON accommodations;
DROP TRIGGER IF EXISTS set_travel_documents_updated_at ON travel_documents;
DROP TRIGGER IF EXISTS set_travel_expenses_updated_at ON travel_expenses;
DROP FUNCTION IF EXISTS set_updated_at();

-- Create trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER set_travel_requests_updated_at
  BEFORE UPDATE ON travel_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_flight_bookings_updated_at
  BEFORE UPDATE ON flight_bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_accommodations_updated_at
  BEFORE UPDATE ON accommodations
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_travel_documents_updated_at
  BEFORE UPDATE ON travel_documents
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_travel_expenses_updated_at
  BEFORE UPDATE ON travel_expenses
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '✅ TRAVEL MANAGEMENT SYSTEM - SETUP COMPLETE!';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Database Objects Created:';
  RAISE NOTICE '  - 5 Tables (travel_requests, flight_bookings, accommodations, travel_documents, travel_expenses)';
  RAISE NOTICE '  - 6 Enum Types (travel_type, travel_status, flight_class, etc.)';
  RAISE NOTICE '  - 13 RLS Policies';
  RAISE NOTICE '  - 12 Indexes';
  RAISE NOTICE '  - 5 Update Triggers';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Security:';
  RAISE NOTICE '  - Row Level Security enabled on all tables';
  RAISE NOTICE '  - Company-scoped data isolation';
  RAISE NOTICE '  - Role-based access control';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next Steps:';
  RAISE NOTICE '  1. Run: travel-notification-triggers.sql';
  RAISE NOTICE '  2. Run: travel-storage-setup.sql';
  RAISE NOTICE '  3. Test the Travel Management UI';
  RAISE NOTICE '';
END $$;

