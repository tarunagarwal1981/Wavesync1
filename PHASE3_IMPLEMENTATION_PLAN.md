# WaveSync Phase 3 - Advanced Features & Integration

## 🎯 Overview

Phase 3 focuses on advanced features that complete the maritime workflow, including travel/ticket management, training modules, advanced analytics, and system integrations. This phase transforms WaveSync into a comprehensive maritime crew management platform.

---

## 📋 Phase 3 Priority Features

Based on the original workflow requirements and maritime industry needs, Phase 3 will implement:

### **Priority 1: Travel & Ticket Management** ⭐⭐⭐
Essential for seafarer logistics and operations.

### **Priority 2: Training & Certification Module** ⭐⭐⭐
Critical for compliance and crew development.

### **Priority 3: Advanced Analytics & Reporting** ⭐⭐
Important for business intelligence and decision-making.

### **Priority 4: Enhanced Notifications** ⭐⭐
Email notifications and user preferences.

### **Priority 5: System Integrations** ⭐
API integrations for external systems.

---

## 🎫 Feature 1: Travel & Ticket Management

### **Business Requirement:**
Manning teams need to manage seafarer travel arrangements, including flights, tickets, accommodations, and travel documents for sign-on and sign-off assignments.

### **User Stories:**

**As a Company User (Manning Team), I want to:**
- Create travel requests for seafarer sign-on/sign-off
- Book and manage flight tickets
- Track travel status and documents
- Upload and manage travel documents (tickets, boarding passes, visas)
- Receive notifications when travel is confirmed/changed
- View upcoming travel schedule

**As a Seafarer, I want to:**
- View my upcoming travel itinerary
- Access my travel documents (e-tickets, boarding passes)
- Receive notifications about travel updates
- Submit travel expenses
- Update travel status (departed, arrived)

### **Database Schema:**

```sql
-- Travel Requests Table
CREATE TABLE travel_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seafarer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  
  -- Travel Details
  travel_type VARCHAR(20) NOT NULL CHECK (travel_type IN ('sign_on', 'sign_off', 'leave', 'medical', 'emergency')),
  request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  travel_date DATE NOT NULL,
  
  -- Origin and Destination
  origin_port VARCHAR(255),
  origin_city VARCHAR(255) NOT NULL,
  origin_country VARCHAR(100) NOT NULL,
  destination_port VARCHAR(255),
  destination_city VARCHAR(255) NOT NULL,
  destination_country VARCHAR(100) NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'booked', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Additional Info
  notes TEXT,
  special_requirements TEXT,
  
  -- Audit
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flight Bookings Table
CREATE TABLE flight_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_request_id UUID REFERENCES travel_requests(id) ON DELETE CASCADE NOT NULL,
  
  -- Flight Details
  booking_reference VARCHAR(50),
  airline VARCHAR(100),
  flight_number VARCHAR(20),
  
  -- Schedule
  departure_date TIMESTAMP WITH TIME ZONE NOT NULL,
  arrival_date TIMESTAMP WITH TIME ZONE NOT NULL,
  departure_airport VARCHAR(10) NOT NULL, -- IATA code
  arrival_airport VARCHAR(10) NOT NULL,   -- IATA code
  
  -- Booking Info
  seat_number VARCHAR(10),
  class VARCHAR(20) CHECK (class IN ('economy', 'premium_economy', 'business', 'first')),
  ticket_cost DECIMAL(10,2),
  baggage_allowance VARCHAR(50),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'ticketed', 'boarded', 'completed', 'cancelled')),
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Travel Documents Table
CREATE TABLE travel_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_request_id UUID REFERENCES travel_requests(id) ON DELETE CASCADE NOT NULL,
  seafarer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Document Details
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('ticket', 'boarding_pass', 'visa', 'travel_permit', 'covid_certificate', 'insurance', 'itinerary', 'receipt', 'other')),
  document_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(50),
  
  -- Metadata
  issue_date DATE,
  expiry_date DATE,
  document_number VARCHAR(100),
  issuing_authority VARCHAR(255),
  
  -- Status
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES user_profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Audit
  uploaded_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Travel Expenses Table
CREATE TABLE travel_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_request_id UUID REFERENCES travel_requests(id) ON DELETE CASCADE NOT NULL,
  seafarer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  
  -- Expense Details
  expense_type VARCHAR(50) NOT NULL CHECK (expense_type IN ('accommodation', 'food', 'transportation', 'visa_fee', 'medical', 'communication', 'other')),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  expense_date DATE NOT NULL,
  description TEXT,
  
  -- Receipt
  receipt_file_path TEXT,
  receipt_number VARCHAR(100),
  
  -- Approval
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reimbursed')),
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  approval_notes TEXT,
  
  -- Reimbursement
  reimbursed_amount DECIMAL(10,2),
  reimbursed_at TIMESTAMP WITH TIME ZONE,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_travel_requests_seafarer ON travel_requests(seafarer_id);
CREATE INDEX idx_travel_requests_company ON travel_requests(company_id);
CREATE INDEX idx_travel_requests_status ON travel_requests(status);
CREATE INDEX idx_travel_requests_date ON travel_requests(travel_date);
CREATE INDEX idx_flight_bookings_travel_request ON flight_bookings(travel_request_id);
CREATE INDEX idx_travel_documents_travel_request ON travel_documents(travel_request_id);
CREATE INDEX idx_travel_expenses_travel_request ON travel_expenses(travel_request_id);
```

### **UI Components:**

1. **TravelManagement.tsx** - Company user interface
   - Create travel requests
   - Manage bookings
   - Approve expenses
   - View travel calendar

2. **MyTravel.tsx** - Seafarer interface
   - View upcoming travel
   - Access travel documents
   - Submit expenses
   - Update travel status

3. **TravelCalendar.tsx** - Calendar view
   - Monthly/weekly view
   - Travel timeline
   - Conflict detection

4. **FlightBooking.tsx** - Flight booking interface
   - Search flights
   - Book tickets
   - Manage bookings

5. **TravelExpenses.tsx** - Expense management
   - Submit expenses
   - Upload receipts
   - Track reimbursements

### **Notification Triggers:**

- Travel request created → Notify seafarer & manning team
- Travel confirmed → Notify seafarer
- Flight booked → Notify seafarer with details
- Travel date approaching (7 days) → Reminder notification
- Travel date approaching (24 hours) → Urgent reminder
- Expense submitted → Notify approver
- Expense approved/rejected → Notify seafarer
- Travel status updated → Notify relevant parties

---

## 📚 Feature 2: Training & Certification Module

### **Business Requirement:**
Track mandatory and optional training courses, certifications, and compliance requirements for seafarers.

### **User Stories:**

**As a Company User, I want to:**
- Assign training courses to seafarers
- Track training completion status
- Monitor certification expiry dates
- Upload training certificates
- Generate training compliance reports

**As a Seafarer, I want to:**
- View assigned training courses
- Access training materials
- Upload completed course certificates
- Track my certification status
- Receive alerts for expiring certifications

### **Database Schema:**

```sql
-- Training Courses Table
CREATE TABLE training_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Course Details
  course_name VARCHAR(255) NOT NULL,
  course_code VARCHAR(50),
  description TEXT,
  category VARCHAR(100) CHECK (category IN ('safety', 'security', 'medical', 'technical', 'leadership', 'compliance', 'other')),
  
  -- Course Info
  provider VARCHAR(255),
  duration_hours INTEGER,
  validity_period_months INTEGER, -- How long the certification is valid
  is_mandatory BOOLEAN DEFAULT false,
  
  -- Requirements
  prerequisites TEXT[],
  target_ranks VARCHAR(100)[],
  
  -- Content
  course_materials_url TEXT,
  syllabus_file_path TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training Assignments Table
CREATE TABLE training_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES training_courses(id) ON DELETE CASCADE NOT NULL,
  seafarer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  
  -- Assignment Details
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date DATE,
  assigned_by UUID REFERENCES user_profiles(id),
  
  -- Status
  status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'expired', 'cancelled')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Completion
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  score DECIMAL(5,2), -- Optional test score
  
  -- Notes
  notes TEXT,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training Certificates Table
CREATE TABLE training_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seafarer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES training_courses(id) ON DELETE SET NULL,
  training_assignment_id UUID REFERENCES training_assignments(id) ON DELETE SET NULL,
  
  -- Certificate Details
  certificate_name VARCHAR(255) NOT NULL,
  certificate_number VARCHAR(100) UNIQUE,
  issuing_authority VARCHAR(255),
  issue_date DATE NOT NULL,
  expiry_date DATE,
  
  -- File
  certificate_file_path TEXT,
  
  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES user_profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Audit
  uploaded_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_training_courses_company ON training_courses(company_id);
CREATE INDEX idx_training_assignments_seafarer ON training_assignments(seafarer_id);
CREATE INDEX idx_training_assignments_status ON training_assignments(status);
CREATE INDEX idx_training_certificates_seafarer ON training_certificates(seafarer_id);
CREATE INDEX idx_training_certificates_expiry ON training_certificates(expiry_date);
```

### **UI Components:**

1. **TrainingManagement.tsx** - Company interface
2. **MyCourses.tsx** - Seafarer training dashboard
3. **CourseDetails.tsx** - Course information
4. **CertificateUpload.tsx** - Certificate management
5. **TrainingCalendar.tsx** - Training schedule

---

## 📊 Feature 3: Advanced Analytics & Reporting

### **Dashboards to Enhance:**

**Admin Dashboard:**
- User growth trends
- Company activity metrics
- Assignment completion rates
- Document compliance rates
- System usage analytics

**Company Dashboard:**
- Crew availability overview
- Assignment timeline
- Document expiry forecast
- Training compliance
- Cost analytics

**Seafarer Dashboard:**
- Assignment history
- Document status overview
- Training progress
- Upcoming deadlines

### **Components:**

1. **Charts & Visualizations:**
   - Assignment status pie chart
   - Document expiry timeline
   - Training completion bar chart
   - Monthly activity line chart
   - Crew availability heatmap

2. **Reports:**
   - Crew roster report
   - Assignment history report
   - Document compliance report
   - Training completion report
   - Expense summary report

---

## 📧 Feature 4: Enhanced Notification System

### **Email Notifications:**

Implement email notifications for critical events using Supabase Edge Functions or third-party service (SendGrid, Resend, etc.)

**Email Triggers:**
- Assignment created/updated
- Document expiring (30, 15, 7 days)
- Training assigned
- Travel booked
- Expense approved/rejected

### **Notification Preferences:**

User interface to manage notification settings:
- Enable/disable email notifications
- Enable/disable in-app notifications
- Notification frequency (immediate, daily digest, weekly summary)
- Notification types to receive

---

## 🔌 Feature 5: System Integrations

### **Potential Integrations:**

1. **Calendar Integration:**
   - Google Calendar
   - Outlook Calendar
   - iCal export

2. **Communication:**
   - Email integration
   - SMS notifications (Twilio)
   - WhatsApp Business API

3. **Document Management:**
   - Digital signature (DocuSign, HelloSign)
   - Document scanning (OCR)

4. **Travel:**
   - Flight booking APIs
   - Hotel booking APIs
   - Travel management systems

5. **HR Systems:**
   - Payroll integration
   - Time tracking
   - Expense management

---

## 🗓️ Phase 3 Implementation Timeline

### **Sprint 1 (Week 1-2): Travel Management Foundation**
- ✅ Database schema setup
- ✅ Travel request system
- ✅ Basic travel UI
- ✅ Travel notifications

### **Sprint 2 (Week 3-4): Travel Management Advanced**
- ✅ Flight booking system
- ✅ Travel documents
- ✅ Expense management
- ✅ Travel calendar

### **Sprint 3 (Week 5-6): Training Module**
- ✅ Training courses setup
- ✅ Course assignments
- ✅ Certificate management
- ✅ Training dashboard

### **Sprint 4 (Week 7-8): Analytics & Reporting**
- ✅ Dashboard enhancements
- ✅ Charts and graphs
- ✅ Report generation
- ✅ Data export

### **Sprint 5 (Week 9-10): Notifications & Polish**
- ✅ Email notifications
- ✅ Notification preferences
- ✅ UI polish
- ✅ Testing & bug fixes

---

## 🎯 Success Criteria

Phase 3 will be considered complete when:

1. ✅ Travel management system is operational
2. ✅ Training module is functional
3. ✅ Enhanced analytics are visible on dashboards
4. ✅ Email notifications are working
5. ✅ User notification preferences are configurable
6. ✅ All features are tested and documented
7. ✅ System performance is optimized
8. ✅ Mobile responsiveness is verified

---

## 📝 Documentation Deliverables

1. Travel Management User Guide
2. Training Module User Guide
3. Analytics & Reporting Guide
4. API Documentation (if applicable)
5. Phase 3 Testing Guide
6. Phase 3 Completion Summary

---

## 🚀 Let's Start with Sprint 1: Travel Management!

**Next Immediate Steps:**

1. ✅ Create database schema for travel management
2. ✅ Set up RLS policies
3. ✅ Create TravelManagement component
4. ✅ Create MyTravel component for seafarers
5. ✅ Add notification triggers
6. ✅ Test travel request workflow

**Ready to begin implementing Travel Management?** 🎫✈️
