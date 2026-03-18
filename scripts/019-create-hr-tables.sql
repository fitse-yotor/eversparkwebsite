-- HR Management System - Phase 1: Employee Management & Leave System
-- Migration: 019-create-hr-tables.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DEPARTMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  description TEXT,
  head_id UUID, -- References employees(id), added later
  parent_department_id UUID REFERENCES departments(id),
  budget DECIMAL(12,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- POSITIONS / JOB TITLES
-- ============================================
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  code TEXT UNIQUE,
  department_id UUID REFERENCES departments(id),
  level TEXT CHECK (level IN ('intern', 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'executive')),
  description TEXT,
  responsibilities TEXT[],
  requirements TEXT[],
  min_salary DECIMAL(10,2),
  max_salary DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EMPLOYEES
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) UNIQUE, -- Link to auth system
  employee_id TEXT UNIQUE NOT NULL, -- EMP001, EMP002
  
  -- Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  marital_status TEXT CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
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
  employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern')) DEFAULT 'full_time',
  join_date DATE NOT NULL,
  probation_end_date DATE,
  confirmation_date DATE,
  resignation_date DATE,
  last_working_date DATE,
  
  -- Reporting
  manager_id UUID REFERENCES employees(id),
  
  -- Salary (basic - detailed in salary_structures table)
  basic_salary DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'on_probation', 'suspended', 'terminated', 'resigned')),
  
  -- Profile
  profile_photo_url TEXT,
  bio TEXT,
  
  -- Bank Details (for payroll)
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_holder_name TEXT,
  bank_branch TEXT,
  bank_ifsc_code TEXT,
  
  -- System
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Add foreign key for department head after employees table is created
ALTER TABLE departments ADD CONSTRAINT fk_department_head 
  FOREIGN KEY (head_id) REFERENCES employees(id);

-- ============================================
-- EMPLOYEE DOCUMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS employee_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  document_type TEXT CHECK (document_type IN ('contract', 'id_card', 'passport', 'certificate', 'resume', 'offer_letter', 'other')),
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INT,
  mime_type TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  expiry_date DATE,
  notes TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ
);

-- ============================================
-- LEAVE TYPES
-- ============================================
CREATE TABLE IF NOT EXISTS leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- AL, SL, CL, ML, PL, UL
  description TEXT,
  is_paid BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT true,
  requires_document BOOLEAN DEFAULT false,
  max_days_per_request INT,
  min_notice_days INT DEFAULT 1,
  color TEXT DEFAULT '#3b82f6', -- for calendar display
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default leave types
INSERT INTO leave_types (name, code, description, is_paid, requires_document, max_days_per_request, min_notice_days, color) VALUES
  ('Annual Leave', 'AL', 'Paid annual vacation leave', true, false, 15, 7, '#10b981'),
  ('Sick Leave', 'SL', 'Paid sick leave with medical certificate', true, true, 5, 0, '#ef4444'),
  ('Casual Leave', 'CL', 'Short notice casual leave', true, false, 3, 1, '#f59e0b'),
  ('Maternity Leave', 'ML', 'Maternity leave for female employees', true, true, 90, 30, '#ec4899'),
  ('Paternity Leave', 'PL', 'Paternity leave for male employees', true, false, 7, 7, '#8b5cf6'),
  ('Unpaid Leave', 'UL', 'Leave without pay', false, false, 30, 7, '#6b7280'),
  ('Work From Home', 'WFH', 'Work from home day', true, false, 5, 1, '#06b6d4'),
  ('Compensatory Off', 'CO', 'Compensatory off for overtime work', true, false, 2, 1, '#14b8a6')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- LEAVE POLICIES
-- ============================================
CREATE TABLE IF NOT EXISTS leave_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_type_id UUID REFERENCES leave_types(id) ON DELETE CASCADE,
  employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern')),
  
  -- Entitlement
  annual_entitlement DECIMAL(5,2) NOT NULL, -- 21.0 days per year
  accrual_type TEXT CHECK (accrual_type IN ('yearly', 'monthly', 'none')) DEFAULT 'yearly',
  accrual_rate DECIMAL(5,2), -- 1.75 days per month for monthly accrual
  
  -- Carry forward rules
  max_carry_forward INT DEFAULT 0,
  carry_forward_expiry_months INT DEFAULT 3,
  
  -- Other rules
  allow_negative_balance BOOLEAN DEFAULT false,
  encashment_allowed BOOLEAN DEFAULT false,
  max_encashment_days INT,
  probation_applicable BOOLEAN DEFAULT true,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(leave_type_id, employment_type)
);

-- Insert default leave policies for full-time employees
INSERT INTO leave_policies (leave_type_id, employment_type, annual_entitlement, accrual_type, accrual_rate, max_carry_forward, encashment_allowed, max_encashment_days)
SELECT id, 'full_time', 
  CASE 
    WHEN code = 'AL' THEN 21.0
    WHEN code = 'SL' THEN 10.0
    WHEN code = 'CL' THEN 7.0
    WHEN code = 'ML' THEN 90.0
    WHEN code = 'PL' THEN 7.0
    WHEN code = 'WFH' THEN 24.0
    WHEN code = 'CO' THEN 0.0
    ELSE 0.0
  END,
  CASE 
    WHEN code IN ('AL', 'SL', 'CL', 'WFH') THEN 'monthly'
    ELSE 'yearly'
  END,
  CASE 
    WHEN code = 'AL' THEN 1.75
    WHEN code = 'SL' THEN 0.83
    WHEN code = 'CL' THEN 0.58
    WHEN code = 'WFH' THEN 2.0
    ELSE 0.0
  END,
  CASE 
    WHEN code = 'AL' THEN 5
    WHEN code = 'SL' THEN 3
    ELSE 0
  END,
  CASE 
    WHEN code = 'AL' THEN true
    ELSE false
  END,
  CASE 
    WHEN code = 'AL' THEN 10
    ELSE 0
  END
FROM leave_types
ON CONFLICT (leave_type_id, employment_type) DO NOTHING;

-- ============================================
-- EMPLOYEE LEAVE BALANCES
-- ============================================
CREATE TABLE IF NOT EXISTS employee_leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id UUID REFERENCES leave_types(id) ON DELETE CASCADE,
  year INT NOT NULL,
  
  -- Balance tracking
  opening_balance DECIMAL(5,2) DEFAULT 0,
  earned DECIMAL(5,2) DEFAULT 0,
  taken DECIMAL(5,2) DEFAULT 0,
  pending DECIMAL(5,2) DEFAULT 0,
  adjusted DECIMAL(5,2) DEFAULT 0,
  encashed DECIMAL(5,2) DEFAULT 0,
  
  -- Available balance (calculated)
  available DECIMAL(5,2) GENERATED ALWAYS AS 
    (opening_balance + earned - taken - pending + adjusted - encashed) STORED,
  
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(employee_id, leave_type_id, year)
);

-- ============================================
-- LEAVE REQUESTS
-- ============================================
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id UUID REFERENCES leave_types(id),
  
  -- Request details
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_half_day BOOLEAN DEFAULT false,
  half_day_period TEXT CHECK (half_day_period IN ('first_half', 'second_half', NULL)),
  total_days DECIMAL(5,2) NOT NULL,
  
  -- Reason
  reason TEXT NOT NULL,
  notes TEXT,
  attachment_url TEXT,
  
  -- Approval workflow
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'rejected', 'cancelled', 'withdrawn'
  )),
  
  -- Manager approval
  manager_id UUID REFERENCES employees(id),
  manager_approved_at TIMESTAMPTZ,
  manager_comments TEXT,
  
  -- HR approval (for leaves > 5 days or unpaid)
  hr_id UUID REFERENCES employees(id),
  hr_approved_at TIMESTAMPTZ,
  hr_comments TEXT,
  requires_hr_approval BOOLEAN DEFAULT false,
  
  -- Contact during leave
  contact_number TEXT,
  emergency_contact TEXT,
  
  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LEAVE REQUEST HISTORY (Audit Trail)
-- ============================================
CREATE TABLE IF NOT EXISTS leave_request_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_request_id UUID REFERENCES leave_requests(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- submitted, approved, rejected, cancelled, withdrawn
  performed_by UUID REFERENCES profiles(id),
  comments TEXT,
  old_status TEXT,
  new_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PUBLIC HOLIDAYS
-- ============================================
CREATE TABLE IF NOT EXISTS public_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  is_optional BOOLEAN DEFAULT false,
  description TEXT,
  country TEXT DEFAULT 'USA',
  state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert some default US holidays for 2026
INSERT INTO public_holidays (name, date, description, country) VALUES
  ('New Year''s Day', '2026-01-01', 'First day of the year', 'USA'),
  ('Martin Luther King Jr. Day', '2026-01-19', 'Birthday of Martin Luther King Jr.', 'USA'),
  ('Presidents'' Day', '2026-02-16', 'Washington''s Birthday', 'USA'),
  ('Memorial Day', '2026-05-25', 'Honoring military personnel', 'USA'),
  ('Independence Day', '2026-07-04', 'Independence Day', 'USA'),
  ('Labor Day', '2026-09-07', 'Labor Day', 'USA'),
  ('Thanksgiving Day', '2026-11-26', 'Thanksgiving', 'USA'),
  ('Christmas Day', '2026-12-25', 'Christmas', 'USA')
ON CONFLICT DO NOTHING;

-- ============================================
-- LEAVE ENCASHMENT REQUESTS
-- ============================================
CREATE TABLE IF NOT EXISTS leave_encashment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id UUID REFERENCES leave_types(id),
  days_to_encash DECIMAL(5,2) NOT NULL,
  amount DECIMAL(10,2),
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  processed_in_payroll_id UUID, -- Link to payroll when implemented
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);

CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_manager_id ON leave_requests(manager_id);

CREATE INDEX IF NOT EXISTS idx_leave_balances_employee_year ON employee_leave_balances(employee_id, year);

CREATE INDEX IF NOT EXISTS idx_employee_documents_employee_id ON employee_documents(employee_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_request_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_encashment_requests ENABLE ROW LEVEL SECURITY;

-- Departments: Admins can manage, employees can view
CREATE POLICY "Admins can manage departments" ON departments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Employees can view departments" ON departments
  FOR SELECT TO authenticated
  USING (true);

-- Positions: Admins can manage, employees can view
CREATE POLICY "Admins can manage positions" ON positions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Employees can view positions" ON positions
  FOR SELECT TO authenticated
  USING (true);

-- Employees: Admins can manage all, employees can view own and team
CREATE POLICY "Admins can manage all employees" ON employees
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Employees can view own profile" ON employees
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Managers can view team members" ON employees
  FOR SELECT TO authenticated
  USING (
    manager_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Employees can update own basic info" ON employees
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Employee Documents: Admins and employee can view own
CREATE POLICY "Admins can manage all documents" ON employee_documents
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Employees can view own documents" ON employee_documents
  FOR SELECT TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- Leave Types & Policies: Everyone can view, admins can manage
CREATE POLICY "Everyone can view leave types" ON leave_types
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage leave types" ON leave_types
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Everyone can view leave policies" ON leave_policies
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage leave policies" ON leave_policies
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Leave Balances: Employees can view own, admins can manage all
CREATE POLICY "Employees can view own leave balance" ON employee_leave_balances
  FOR SELECT TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all leave balances" ON employee_leave_balances
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Leave Requests: Employees can manage own, managers can view/approve team
CREATE POLICY "Employees can manage own leave requests" ON leave_requests
  FOR ALL TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can view team leave requests" ON leave_requests
  FOR SELECT TO authenticated
  USING (
    manager_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can update team leave requests" ON leave_requests
  FOR UPDATE TO authenticated
  USING (
    manager_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all leave requests" ON leave_requests
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Leave Request History: View only
CREATE POLICY "Users can view relevant leave history" ON leave_request_history
  FOR SELECT TO authenticated
  USING (
    leave_request_id IN (
      SELECT id FROM leave_requests 
      WHERE employee_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid()
      )
      OR manager_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid()
      )
    )
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Public Holidays: Everyone can view
CREATE POLICY "Everyone can view public holidays" ON public_holidays
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage public holidays" ON public_holidays
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Leave Encashment: Employees can request own, admins can manage
CREATE POLICY "Employees can manage own encashment requests" ON leave_encashment_requests
  FOR ALL TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all encashment requests" ON leave_encashment_requests
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_types_updated_at BEFORE UPDATE ON leave_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_policies_updated_at BEFORE UPDATE ON leave_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_public_holidays_updated_at BEFORE UPDATE ON public_holidays
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_encashment_updated_at BEFORE UPDATE ON leave_encashment_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate working days between two dates (excluding weekends and holidays)
CREATE OR REPLACE FUNCTION calculate_working_days(
  start_date DATE,
  end_date DATE,
  country TEXT DEFAULT 'USA'
)
RETURNS DECIMAL AS $$
DECLARE
  working_days DECIMAL := 0;
  current_date DATE := start_date;
  day_of_week INT;
BEGIN
  WHILE current_date <= end_date LOOP
    day_of_week := EXTRACT(DOW FROM current_date);
    
    -- Check if it's not weekend (0 = Sunday, 6 = Saturday)
    IF day_of_week NOT IN (0, 6) THEN
      -- Check if it's not a public holiday
      IF NOT EXISTS (
        SELECT 1 FROM public_holidays 
        WHERE date = current_date AND public_holidays.country = calculate_working_days.country
      ) THEN
        working_days := working_days + 1;
      END IF;
    END IF;
    
    current_date := current_date + INTERVAL '1 day';
  END LOOP;
  
  RETURN working_days;
END;
$$ LANGUAGE plpgsql;

-- Function to initialize leave balances for new employee
CREATE OR REPLACE FUNCTION initialize_employee_leave_balances()
RETURNS TRIGGER AS $$
DECLARE
  current_year INT := EXTRACT(YEAR FROM CURRENT_DATE);
  policy RECORD;
  months_remaining INT;
  prorated_entitlement DECIMAL;
BEGIN
  -- Calculate months remaining in the year
  months_remaining := 12 - EXTRACT(MONTH FROM NEW.join_date) + 1;
  
  -- Create leave balances for each leave type based on employment type
  FOR policy IN 
    SELECT lp.*, lt.code 
    FROM leave_policies lp
    JOIN leave_types lt ON lt.id = lp.leave_type_id
    WHERE lp.employment_type = NEW.employment_type 
    AND lp.is_active = true
  LOOP
    -- Calculate prorated entitlement for first year
    IF policy.accrual_type = 'monthly' THEN
      prorated_entitlement := policy.accrual_rate * months_remaining;
    ELSE
      prorated_entitlement := policy.annual_entitlement;
    END IF;
    
    INSERT INTO employee_leave_balances (
      employee_id,
      leave_type_id,
      year,
      opening_balance,
      earned
    ) VALUES (
      NEW.id,
      policy.leave_type_id,
      current_year,
      0,
      prorated_entitlement
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to initialize leave balances when employee is created
CREATE TRIGGER initialize_leave_balances_on_employee_create
  AFTER INSERT ON employees
  FOR EACH ROW
  EXECUTE FUNCTION initialize_employee_leave_balances();

-- Function to update leave balance when leave request is approved
CREATE OR REPLACE FUNCTION update_leave_balance_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if status changed to approved
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Deduct from pending and add to taken
    UPDATE employee_leave_balances
    SET 
      pending = pending - NEW.total_days,
      taken = taken + NEW.total_days,
      last_updated = NOW()
    WHERE employee_id = NEW.employee_id
      AND leave_type_id = NEW.leave_type_id
      AND year = EXTRACT(YEAR FROM NEW.start_date);
  
  -- If status changed from pending to rejected/cancelled, remove from pending
  ELSIF NEW.status IN ('rejected', 'cancelled') AND OLD.status = 'pending' THEN
    UPDATE employee_leave_balances
    SET 
      pending = pending - NEW.total_days,
      last_updated = NOW()
    WHERE employee_id = NEW.employee_id
      AND leave_type_id = NEW.leave_type_id
      AND year = EXTRACT(YEAR FROM NEW.start_date);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update leave balance on leave request status change
CREATE TRIGGER update_balance_on_leave_approval
  AFTER UPDATE OF status ON leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_leave_balance_on_approval();

-- Function to add pending leave when request is submitted
CREATE OR REPLACE FUNCTION add_pending_leave_on_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Add to pending balance
  UPDATE employee_leave_balances
  SET 
    pending = pending + NEW.total_days,
    last_updated = NOW()
  WHERE employee_id = NEW.employee_id
    AND leave_type_id = NEW.leave_type_id
    AND year = EXTRACT(YEAR FROM NEW.start_date);
  
  -- If balance doesn't exist, create it
  IF NOT FOUND THEN
    INSERT INTO employee_leave_balances (
      employee_id,
      leave_type_id,
      year,
      pending
    ) VALUES (
      NEW.employee_id,
      NEW.leave_type_id,
      EXTRACT(YEAR FROM NEW.start_date),
      NEW.total_days
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to add pending leave when request is created
CREATE TRIGGER add_pending_on_leave_request
  AFTER INSERT ON leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION add_pending_leave_on_request();

COMMENT ON TABLE employees IS 'Employee master data with personal and employment information';
COMMENT ON TABLE leave_requests IS 'Employee leave requests with approval workflow';
COMMENT ON TABLE employee_leave_balances IS 'Leave balance tracking per employee per year';
COMMENT ON TABLE leave_types IS 'Types of leaves available (Annual, Sick, etc.)';
COMMENT ON TABLE leave_policies IS 'Leave policies defining entitlements and rules';
