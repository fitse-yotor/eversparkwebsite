# HR Management System - Complete Specification

## Overview
A comprehensive HR system integrated into your corporate website where:
- **Admins/HR** can manage employees, track attendance, process leave requests, manage payroll
- **Employees** can login, view their profile, request leave, check payslips, clock in/out

---

## Core HR Features

### 1. 👥 Employee Management

#### Employee Registration (Admin Only)
- Personal information (name, email, phone, address, emergency contact)
- Employment details (employee ID, department, position, join date, employment type)
- Salary information (basic salary, allowances, deductions)
- Documents (contracts, certifications, ID copies)
- Bank account details for payroll
- Reporting manager assignment

#### Employee Profile (Employee View)
- View personal information
- Update contact details (with approval)
- View employment history
- Download documents
- View organizational chart

**Database Schema:**
```sql
-- Employees table
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id), -- Link to auth
  employee_id TEXT UNIQUE NOT NULL, -- EMP001, EMP002
  
  -- Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  marital_status TEXT,
  nationality TEXT,
  
  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  
  -- Emergency Contact
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  
  -- Employment Details
  department_id UUID REFERENCES departments(id),
  position_id UUID REFERENCES positions(id),
  employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern')),
  join_date DATE NOT NULL,
  probation_end_date DATE,
  confirmation_date DATE,
  resignation_date DATE,
  last_working_date DATE,
  
  -- Reporting
  manager_id UUID REFERENCES employees(id),
  
  -- Salary (encrypted in production)
  basic_salary DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'suspended', 'terminated', 'resigned')),
  
  -- Profile
  profile_photo_url TEXT,
  bio TEXT,
  
  -- System
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Departments
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  description TEXT,
  head_id UUID REFERENCES employees(id),
  parent_department_id UUID REFERENCES departments(id),
  budget DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Positions/Job Titles
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  code TEXT UNIQUE,
  department_id UUID REFERENCES departments(id),
  level TEXT, -- junior, mid, senior, lead, manager, director
  description TEXT,
  responsibilities TEXT[],
  requirements TEXT[],
  min_salary DECIMAL(10,2),
  max_salary DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee Documents
CREATE TABLE employee_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  document_type TEXT, -- contract, id_card, certificate, resume
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INT,
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  expiry_date DATE, -- for documents that expire
  notes TEXT
);
```

---

### 2. 🏖️ Leave Management System (DETAILED)

#### Leave Types
- Annual Leave / Vacation
- Sick Leave
- Casual Leave
- Maternity/Paternity Leave
- Bereavement Leave
- Unpaid Leave
- Compensatory Off (for overtime)
- Work From Home

#### Leave Policies
- Annual leave entitlement (e.g., 21 days per year)
- Sick leave entitlement (e.g., 10 days per year)
- Carry forward rules (max days to next year)
- Encashment rules (convert unused leave to cash)
- Probation period restrictions
- Notice period requirements
- Half-day leave support
- Public holidays management

#### Leave Request Workflow
1. **Employee submits leave request**
   - Select leave type
   - Choose dates (from/to)
   - Select half-day option if applicable
   - Add reason/notes
   - Attach medical certificate (for sick leave)
   - View available balance before submitting

2. **Manager receives notification**
   - Email/in-app notification
   - View team calendar
   - Check team availability
   - Approve/Reject with comments
   - Request modifications

3. **HR Review (optional)**
   - For long leaves (>5 days)
   - For unpaid leaves
   - Final approval

4. **Auto-deduction from balance**
   - Update leave balance
   - Add to employee calendar
   - Notify employee

#### Leave Balance Tracking
- Real-time balance display
- Accrual system (earn leave monthly)
- Carry forward from previous year
- Adjustment for new joiners (pro-rated)
- Leave encashment calculation

#### Leave Calendar
- Team calendar view
- Department calendar
- Company-wide calendar
- Public holidays
- Who's on leave today/this week

**Database Schema:**
```sql
-- Leave Types
CREATE TABLE leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE, -- AL, SL, CL, ML, PL
  description TEXT,
  is_paid BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT true,
  requires_document BOOLEAN DEFAULT false, -- medical cert for sick leave
  max_days_per_request INT,
  min_notice_days INT, -- how many days in advance to request
  color TEXT, -- for calendar display
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave Policies (per employee or company-wide)
CREATE TABLE leave_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_type_id UUID REFERENCES leave_types(id),
  employment_type TEXT, -- full_time, part_time, contract
  annual_entitlement DECIMAL(5,2), -- 21.0 days
  accrual_type TEXT CHECK (accrual_type IN ('yearly', 'monthly', 'none')),
  accrual_rate DECIMAL(5,2), -- 1.75 days per month
  max_carry_forward INT, -- max days to carry to next year
  carry_forward_expiry_months INT, -- expire after X months
  allow_negative_balance BOOLEAN DEFAULT false,
  encashment_allowed BOOLEAN DEFAULT false,
  probation_applicable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee Leave Balances
CREATE TABLE employee_leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  leave_type_id UUID REFERENCES leave_types(id),
  year INT NOT NULL,
  
  -- Balance tracking
  opening_balance DECIMAL(5,2) DEFAULT 0, -- carried forward
  earned DECIMAL(5,2) DEFAULT 0, -- accrued this year
  taken DECIMAL(5,2) DEFAULT 0, -- used
  pending DECIMAL(5,2) DEFAULT 0, -- in approval
  adjusted DECIMAL(5,2) DEFAULT 0, -- manual adjustments
  encashed DECIMAL(5,2) DEFAULT 0, -- converted to cash
  
  -- Calculated field
  available DECIMAL(5,2) GENERATED ALWAYS AS 
    (opening_balance + earned - taken - pending + adjusted - encashed) STORED,
  
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(employee_id, leave_type_id, year)
);

-- Leave Requests
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  leave_type_id UUID REFERENCES leave_types(id),
  
  -- Request details
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_half_day BOOLEAN DEFAULT false,
  half_day_period TEXT CHECK (half_day_period IN ('first_half', 'second_half')),
  total_days DECIMAL(5,2) NOT NULL, -- 1.0, 0.5, 5.0
  
  -- Reason
  reason TEXT NOT NULL,
  notes TEXT,
  attachment_url TEXT, -- medical certificate, etc.
  
  -- Approval workflow
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'rejected', 'cancelled', 'withdrawn'
  )),
  
  -- Approvers
  manager_id UUID REFERENCES employees(id),
  manager_approved_at TIMESTAMPTZ,
  manager_comments TEXT,
  
  hr_id UUID REFERENCES employees(id),
  hr_approved_at TIMESTAMPTZ,
  hr_comments TEXT,
  
  -- Contact during leave
  contact_number TEXT,
  emergency_contact TEXT,
  
  -- System
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave Request History (audit trail)
CREATE TABLE leave_request_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_request_id UUID REFERENCES leave_requests(id),
  action TEXT, -- submitted, approved, rejected, cancelled
  performed_by UUID REFERENCES profiles(id),
  comments TEXT,
  old_status TEXT,
  new_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public Holidays
CREATE TABLE public_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  is_optional BOOLEAN DEFAULT false,
  description TEXT,
  country TEXT,
  state TEXT, -- for region-specific holidays
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave Encashment Requests
CREATE TABLE leave_encashment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  leave_type_id UUID REFERENCES leave_types(id),
  days_to_encash DECIMAL(5,2) NOT NULL,
  amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMPTZ,
  processed_in_payroll_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Leave Management Features

**For Employees:**
- View leave balance (all types)
- Request new leave
- View leave history
- Cancel pending requests
- View team calendar (who's on leave)
- Download leave report
- Set leave preferences

**For Managers:**
- Approve/reject team leave requests
- View team leave calendar
- Check team availability
- Bulk approve leaves
- Generate team leave reports
- Set auto-approval rules

**For HR/Admin:**
- Manage leave policies
- Adjust leave balances
- Generate company-wide reports
- Configure leave types
- Set public holidays
- Process leave encashment
- Year-end carry forward processing
- Leave accrual automation

---

### 3. ⏰ Attendance & Time Tracking

#### Clock In/Out System
- Web-based clock in/out
- Mobile app support
- GPS location tracking (optional)
- Photo capture on clock in
- Break time tracking
- Overtime calculation

#### Attendance Tracking
- Daily attendance records
- Late arrival tracking
- Early departure tracking
- Absent without leave (AWOL)
- Work from home tracking
- Shift management

**Database Schema:**
```sql
-- Attendance Records
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  date DATE NOT NULL,
  
  -- Clock times
  clock_in_time TIMESTAMPTZ,
  clock_out_time TIMESTAMPTZ,
  
  -- Location (optional)
  clock_in_location TEXT,
  clock_out_location TEXT,
  clock_in_ip TEXT,
  clock_out_ip TEXT,
  
  -- Calculated
  total_hours DECIMAL(5,2),
  regular_hours DECIMAL(5,2),
  overtime_hours DECIMAL(5,2),
  break_hours DECIMAL(5,2),
  
  -- Status
  status TEXT CHECK (status IN ('present', 'absent', 'late', 'half_day', 'on_leave', 'holiday', 'weekend')),
  is_late BOOLEAN DEFAULT false,
  late_by_minutes INT,
  
  -- Notes
  notes TEXT,
  approved_by UUID REFERENCES employees(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(employee_id, date)
);

-- Work Shifts
CREATE TABLE work_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration_minutes INT DEFAULT 60,
  grace_period_minutes INT DEFAULT 15, -- late allowance
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee Shift Assignments
CREATE TABLE employee_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  shift_id UUID REFERENCES work_shifts(id),
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4. 💰 Payroll Management

#### Salary Components
- Basic salary
- House rent allowance (HRA)
- Transport allowance
- Medical allowance
- Performance bonus
- Overtime pay
- Deductions (tax, insurance, loans)

#### Payroll Processing
- Monthly salary calculation
- Attendance-based deductions
- Leave encashment
- Bonus calculation
- Tax calculation
- Generate payslips
- Bank transfer file generation

**Database Schema:**
```sql
-- Salary Components
CREATE TABLE salary_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  type TEXT CHECK (type IN ('earning', 'deduction')),
  calculation_type TEXT CHECK (calculation_type IN ('fixed', 'percentage', 'formula')),
  is_taxable BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee Salary Structure
CREATE TABLE employee_salary_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  effective_from DATE NOT NULL,
  effective_to DATE,
  
  -- Components
  basic_salary DECIMAL(10,2) NOT NULL,
  hra DECIMAL(10,2),
  transport_allowance DECIMAL(10,2),
  medical_allowance DECIMAL(10,2),
  other_allowances JSONB,
  
  -- Deductions
  tax_deduction DECIMAL(10,2),
  insurance_deduction DECIMAL(10,2),
  loan_deduction DECIMAL(10,2),
  other_deductions JSONB,
  
  -- Totals
  gross_salary DECIMAL(10,2),
  total_deductions DECIMAL(10,2),
  net_salary DECIMAL(10,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payroll Runs
CREATE TABLE payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INT NOT NULL,
  year INT NOT NULL,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  payment_date DATE,
  
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'approved', 'paid')),
  
  total_employees INT,
  total_gross DECIMAL(12,2),
  total_deductions DECIMAL(12,2),
  total_net DECIMAL(12,2),
  
  processed_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  processed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(month, year)
);

-- Payslips
CREATE TABLE payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID REFERENCES payroll_runs(id),
  employee_id UUID REFERENCES employees(id),
  
  -- Period
  month INT NOT NULL,
  year INT NOT NULL,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  payment_date DATE,
  
  -- Attendance
  working_days INT,
  present_days DECIMAL(5,2),
  absent_days DECIMAL(5,2),
  paid_leaves DECIMAL(5,2),
  unpaid_leaves DECIMAL(5,2),
  
  -- Earnings
  basic_salary DECIMAL(10,2),
  allowances JSONB,
  overtime_pay DECIMAL(10,2),
  bonus DECIMAL(10,2),
  gross_salary DECIMAL(10,2),
  
  -- Deductions
  tax DECIMAL(10,2),
  insurance DECIMAL(10,2),
  loan_deduction DECIMAL(10,2),
  absence_deduction DECIMAL(10,2),
  other_deductions JSONB,
  total_deductions DECIMAL(10,2),
  
  -- Net
  net_salary DECIMAL(10,2),
  
  -- Payment
  payment_method TEXT, -- bank_transfer, cash, cheque
  payment_status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  
  -- Document
  payslip_pdf_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(employee_id, month, year)
);
```

---

### 5. 📊 Performance Management

#### Performance Reviews
- Annual/quarterly reviews
- Goal setting (OKRs/KPIs)
- 360-degree feedback
- Self-assessment
- Manager assessment
- Peer reviews

#### Performance Tracking
- Goal progress tracking
- Performance ratings
- Improvement plans
- Promotion recommendations

**Database Schema:**
```sql
-- Performance Review Cycles
CREATE TABLE review_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('annual', 'quarterly', 'probation', 'project_based')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  review_deadline DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee Reviews
CREATE TABLE employee_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_cycle_id UUID REFERENCES review_cycles(id),
  employee_id UUID REFERENCES employees(id),
  reviewer_id UUID REFERENCES employees(id),
  
  -- Ratings (1-5 scale)
  technical_skills_rating INT CHECK (technical_skills_rating BETWEEN 1 AND 5),
  communication_rating INT CHECK (communication_rating BETWEEN 1 AND 5),
  teamwork_rating INT CHECK (teamwork_rating BETWEEN 1 AND 5),
  leadership_rating INT CHECK (leadership_rating BETWEEN 1 AND 5),
  punctuality_rating INT CHECK (punctuality_rating BETWEEN 1 AND 5),
  overall_rating DECIMAL(3,2),
  
  -- Feedback
  strengths TEXT,
  areas_for_improvement TEXT,
  achievements TEXT,
  goals_for_next_period TEXT,
  
  -- Recommendations
  promotion_recommended BOOLEAN DEFAULT false,
  salary_increase_recommended BOOLEAN DEFAULT false,
  recommended_increase_percentage DECIMAL(5,2),
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'acknowledged', 'completed')),
  
  submitted_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals/OKRs
CREATE TABLE employee_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- technical, business, personal_development
  target_date DATE,
  progress INT DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 6. 📚 Training & Development

- Training programs
- Course enrollment
- Certification tracking
- Skill matrix
- Training calendar
- Training feedback

---

### 7. 📝 Document Management

- Employee handbook
- Policy documents
- Forms and templates
- Announcements
- Company news

---

### 8. 📱 Employee Self-Service Portal

**Dashboard:**
- Quick stats (leave balance, attendance, upcoming holidays)
- Recent payslips
- Pending approvals (for managers)
- Company announcements
- Birthday/work anniversary notifications

**Features:**
- Update personal information
- View and download payslips
- Request leave
- Clock in/out
- View attendance history
- Submit expense claims
- View team directory
- Access company documents

---

## User Roles & Permissions

### 1. Super Admin
- Full system access
- Manage all HR settings
- View all employee data
- Generate all reports

### 2. HR Manager
- Manage employees
- Process payroll
- Approve leaves (final approval)
- Generate reports
- Manage policies

### 3. Department Manager
- View team data
- Approve team leaves
- View team attendance
- Conduct performance reviews
- View team payroll summary

### 4. Employee
- View own data
- Request leave
- Clock in/out
- View payslips
- Update personal info
- Submit expense claims

---

## Implementation Priority

### Phase 1 (Core - 2-3 weeks)
1. Employee registration & profiles
2. Basic leave management
3. Leave request workflow
4. Employee dashboard

### Phase 2 (Essential - 2-3 weeks)
5. Attendance tracking
6. Clock in/out system
7. Leave balance automation
8. Manager approval workflow

### Phase 3 (Advanced - 3-4 weeks)
9. Payroll management
10. Payslip generation
11. Performance reviews
12. Reports & analytics

### Phase 4 (Optional - 2-3 weeks)
13. Training management
14. Document management
15. Mobile app
16. Advanced analytics

---

## Technical Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage (for documents, photos)
- **PDF Generation**: react-pdf or jsPDF (for payslips)
- **Email**: Resend or SendGrid (for notifications)
- **Calendar**: react-big-calendar
- **Charts**: Recharts (for analytics)

---

## Next Steps

Would you like me to:
1. Start implementing Phase 1 (Employee Management + Leave System)?
2. Create detailed wireframes/mockups?
3. Set up the database schema first?
4. Create a demo/prototype?

Let me know and I'll begin implementation!
