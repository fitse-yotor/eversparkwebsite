# HR Management System - Complete Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Features](#features)
5. [User Roles & Access Control](#user-roles--access-control)
6. [API Endpoints](#api-endpoints)
7. [UI Components](#ui-components)
8. [Workflows](#workflows)
9. [Configuration](#configuration)
10. [Troubleshooting](#troubleshooting)

---

## System Overview

The HR Management System is a comprehensive employee management platform built with Next.js 14, Supabase, and TypeScript. It provides complete HR functionality including employee management, leave tracking, department organization, and onboarding workflows.

### Key Capabilities
- Employee lifecycle management (onboarding to termination)
- Leave request and approval workflows
- Department and position management
- Automated email notifications
- Role-based access control
- Dashboard analytics and reporting

### Technology Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Email**: Resend API
- **UI**: Tailwind CSS, shadcn/ui components

---

## Architecture

### System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ HR Dashboard │  │   Employee   │  │    Leave     │      │
│  │              │  │  Management  │  │  Management  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js Application                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Middleware │  │ Server       │  │  API Routes  │      │
│  │   (Auth)     │  │ Actions      │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │     Auth     │  │   Storage    │      │
│  │   Database   │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │  Resend API  │  │  File Upload │                         │
│  │   (Email)    │  │   Service    │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### Folder Structure
```
app/
├── hr/                          # HR Module
│   ├── dashboard/              # HR Dashboard
│   ├── employees/              # Employee Management
│   │   ├── add/               # Add Employee
│   │   └── [id]/              # Employee Details
│   │       └── edit/          # Edit Employee
│   ├── departments/            # Department Management
│   ├── leaves/                 # Leave Management
│   ├── leave-types/            # Leave Type Configuration
│   ├── onboarding/             # HR User Onboarding
│   └── actions.ts              # Server Actions
├── employee/                    # Employee Portal
│   ├── dashboard/              # Employee Dashboard
│   └── leave/                  # Leave Requests
│       └── request/            # Request Leave
├── api/                         # API Routes
│   ├── employees/              # Employee APIs
│   │   ├── onboard/           # Onboarding API
│   │   └── resend-credentials/ # Resend Credentials
│   └── hr/                     # HR APIs
│       ├── onboard/            # HR Onboarding
│       └── users/              # User Management
components/
├── hr-sidebar.tsx              # HR Navigation
├── employee-sidebar.tsx        # Employee Navigation
└── ui/                         # Reusable UI Components
lib/
├── auth.ts                     # Authentication Utilities
├── email-service.ts            # Email Service
└── supabase/                   # Supabase Clients
scripts/
└── 019-create-hr-tables.sql    # Database Schema
```

---

## Database Schema

### Core Tables

#### 1. **employees**
Primary table for employee data.

```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) UNIQUE,
  employee_id TEXT UNIQUE NOT NULL,
  
  -- Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  marital_status TEXT,
  nationality TEXT,
  
  -- Address
  address_line1 TEXT,
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
  employment_type TEXT DEFAULT 'full_time',
  join_date DATE NOT NULL,
  manager_id UUID REFERENCES employees(id),
  
  -- Salary
  basic_salary DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  
  -- Status
  status TEXT DEFAULT 'active',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Fields:**
- `employee_id`: Unique identifier (EMP001, EMP002, etc.)
- `user_id`: Links to authentication system
- `status`: active, on_leave, on_probation, suspended, terminated
- `employment_type`: full_time, part_time, contract, intern

#### 2. **departments**
Organizational structure.

```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  description TEXT,
  head_id UUID REFERENCES employees(id),
  parent_department_id UUID REFERENCES departments(id),
  budget DECIMAL(12,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. **positions**
Job titles and roles.

```sql
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  code TEXT UNIQUE,
  department_id UUID REFERENCES departments(id),
  level TEXT,
  description TEXT,
  responsibilities TEXT[],
  requirements TEXT[],
  min_salary DECIMAL(10,2),
  max_salary DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. **leave_types**
Types of leave available.

```sql
CREATE TABLE leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  is_paid BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT true,
  requires_document BOOLEAN DEFAULT false,
  max_days_per_request INT,
  min_notice_days INT DEFAULT 1,
  color TEXT DEFAULT '#3b82f6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Default Leave Types:**
- Annual Leave (AL) - 21 days/year
- Sick Leave (SL) - 10 days/year
- Casual Leave (CL) - 7 days/year
- Maternity Leave (ML) - 90 days
- Paternity Leave (PL) - 7 days
- Unpaid Leave (UL)
- Work From Home (WFH) - 24 days/year
- Compensatory Off (CO)

#### 5. **leave_requests**
Employee leave applications.

```sql
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  leave_type_id UUID REFERENCES leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_half_day BOOLEAN DEFAULT false,
  total_days DECIMAL(5,2) NOT NULL,
  reason TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  manager_id UUID REFERENCES employees(id),
  manager_approved_at TIMESTAMPTZ,
  manager_comments TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Status Values:**
- `pending`: Awaiting approval
- `approved`: Approved by manager/HR
- `rejected`: Rejected
- `cancelled`: Cancelled by employee
- `withdrawn`: Withdrawn by employee

#### 6. **employee_leave_balances**
Leave balance tracking.

```sql
CREATE TABLE employee_leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  leave_type_id UUID REFERENCES leave_types(id),
  year INT NOT NULL,
  opening_balance DECIMAL(5,2) DEFAULT 0,
  earned DECIMAL(5,2) DEFAULT 0,
  taken DECIMAL(5,2) DEFAULT 0,
  pending DECIMAL(5,2) DEFAULT 0,
  adjusted DECIMAL(5,2) DEFAULT 0,
  available DECIMAL(5,2) GENERATED ALWAYS AS 
    (opening_balance + earned - taken - pending + adjusted) STORED,
  UNIQUE(employee_id, leave_type_id, year)
);
```

### Database Triggers & Functions

#### Auto-Initialize Leave Balances
```sql
CREATE FUNCTION initialize_employee_leave_balances()
RETURNS TRIGGER AS $$
BEGIN
  -- Creates leave balances for new employees
  -- Prorates entitlement based on join date
END;
$$ LANGUAGE plpgsql;
```

#### Update Leave Balance on Approval
```sql
CREATE FUNCTION update_leave_balance_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Updates balance when leave is approved/rejected
END;
$$ LANGUAGE plpgsql;
```

---

## Features

### 1. Employee Management

#### Add Employee
**Location**: `/hr/employees/add`

**Features:**
- Auto-generate employee ID (EMP001, EMP002, etc.)
- Personal information capture
- Department and position assignment
- Manager assignment
- Employment type and salary details
- Automatic user account creation
- Email credentials to employee

**Workflow:**
1. HR fills employee form
2. System generates unique employee ID
3. Creates employee record
4. Creates user account with role "employee"
5. Sends welcome email with login credentials
6. Initializes leave balances

#### View Employees
**Location**: `/hr/employees`

**Features:**
- Searchable employee list
- Filter by department, status
- Quick actions: View, Edit, Resend Credentials, Terminate
- Employee status badges
- Pagination support

#### Employee Details
**Location**: `/hr/employees/[id]`

**Features:**
- Complete employee profile
- Employment history
- Leave balance summary
- Documents management
- Performance records

#### Edit Employee
**Location**: `/hr/employees/[id]/edit`

**Features:**
- Update personal information
- Change department/position
- Modify salary
- Update status
- Add notes

#### Resend Credentials
**Feature**: Resend login credentials to employee

**Workflow:**
1. HR clicks "Resend Credentials" button
2. System generates new temporary password
3. Updates user password in database
4. Sends email with new credentials
5. Employee receives email with login link

### 2. Leave Management

#### View Leave Requests
**Location**: `/hr/leaves`

**Features:**
- Tabbed view: All, Pending, Approved, Rejected
- Search and filter capabilities
- Status indicators with icons
- Quick approve/reject actions
- Leave balance visibility

#### Leave Request Details
**Features:**
- Employee information
- Leave type and duration
- Reason and notes
- Status history
- Approve/reject with comments

#### Approve/Reject Leave
**Workflow:**
1. HR reviews leave request
2. Checks employee leave balance
3. Adds comments (optional for approve, required for reject)
4. Approves or rejects
5. System updates leave balance
6. Sends notification email to employee

### 3. Department Management

#### View Departments
**Location**: `/hr/departments`

**Features:**
- List all departments
- Department hierarchy
- Budget tracking
- Department head assignment

#### Add/Edit Department
**Features:**
- Department name and code
- Description
- Parent department (for hierarchy)
- Budget allocation
- Department head selection

### 4. Leave Type Configuration

#### Manage Leave Types
**Location**: `/hr/leave-types`

**Features:**
- View all leave types
- Configure entitlements
- Set approval requirements
- Document requirements
- Color coding for calendar

### 5. HR Dashboard

#### Dashboard Analytics
**Location**: `/hr/dashboard`

**Metrics:**
- Total employees
- Pending leave requests
- Employees on leave today
- New employees this month

**Quick Actions:**
- Add employee
- View leave requests
- Access reports

**Recent Activity:**
- Pending leave requests (top 5)
- Recent employees (top 5)

**Quick Links:**
- Employees
- Leave Management
- Departments
- Reports

### 6. HR User Onboarding

#### Onboard HR User
**Location**: `/hr/onboarding`

**Features:**
- Create HR user accounts
- Assign HR role
- Send welcome email
- Set initial password

**Workflow:**
1. Admin/Super Admin fills form
2. System creates user with role "hr"
3. Generates temporary password
4. Sends welcome email
5. HR user logs in and changes password

---

## User Roles & Access Control

### Role Hierarchy
```
super_admin (highest)
    ↓
  admin
    ↓
   hr
    ↓
employee (lowest)
```

### Role Permissions

#### Super Admin
- Full system access
- Can access HR and Admin modules
- Can create admin and HR users
- Can modify system settings

#### Admin
- Access to Admin module
- Access to HR module
- Can manage content
- Can create HR users
- Cannot create other admins

#### HR
- Access to HR module only
- Can manage employees
- Can approve/reject leaves
- Can manage departments
- Cannot access admin functions

#### Employee
- Access to Employee portal only
- Can view own profile
- Can request leave
- Can view leave balance
- Cannot access HR or Admin modules

### Route Protection

#### Middleware Configuration
**File**: `middleware.ts`

```typescript
// HR routes - accessible by hr, admin, super_admin
if (path.startsWith('/hr/')) {
  if (!['hr', 'admin', 'super_admin'].includes(userRole)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }
}

// Employee routes - accessible by employee only
if (path.startsWith('/employee/')) {
  if (userRole !== 'employee') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }
}

// Admin routes - accessible by admin, super_admin
if (path.startsWith('/admin/')) {
  if (!['admin', 'super_admin'].includes(userRole)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }
}
```

### Row Level Security (RLS)

#### Employees Table
```sql
-- Admins can manage all employees
CREATE POLICY "Admins can manage all employees" ON employees
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin', 'hr')
    )
  );

-- Employees can view own profile
CREATE POLICY "Employees can view own profile" ON employees
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
```

#### Leave Requests Table
```sql
-- Employees can manage own leave requests
CREATE POLICY "Employees can manage own leave requests" ON leave_requests
  FOR ALL TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- HR can manage all leave requests
CREATE POLICY "HR can manage all leave requests" ON leave_requests
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin', 'hr')
    )
  );
```

---

## API Endpoints

### Employee APIs

#### 1. Get All Employees
```
GET /api/employees
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "employee_id": "EMP001",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "department": {
        "id": "uuid",
        "name": "Engineering"
      },
      "position": {
        "id": "uuid",
        "title": "Software Engineer"
      },
      "status": "active",
      "join_date": "2024-01-15"
    }
  ]
}
```

#### 2. Onboard Employee
```
POST /api/employees/onboard
```

**Request Body:**
```json
{
  "employee_id": "EMP001",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "department_id": "uuid",
  "position_id": "uuid",
  "employment_type": "full_time",
  "join_date": "2024-01-15",
  "basic_salary": 75000,
  "manager_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Employee onboarded successfully",
  "data": {
    "employee": { /* employee object */ },
    "user": { /* user object */ },
    "credentials": {
      "email": "john@example.com",
      "temporaryPassword": "TempPass123!"
    }
  }
}
```

#### 3. Resend Credentials
```
POST /api/employees/resend-credentials
```

**Request Body:**
```json
{
  "employeeId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Credentials sent successfully to john@example.com"
}
```

### HR APIs

#### 1. Onboard HR User
```
POST /api/hr/onboard
```

**Request Body:**
```json
{
  "email": "hr@example.com",
  "full_name": "Jane Smith",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "HR user created successfully",
  "user": {
    "id": "uuid",
    "email": "hr@example.com",
    "role": "hr"
  }
}
```

#### 2. Get HR Users
```
GET /api/hr/users
```

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": "uuid",
      "email": "hr@example.com",
      "full_name": "Jane Smith",
      "role": "hr",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## UI Components

### HR Sidebar
**File**: `components/hr-sidebar.tsx`

**Features:**
- Responsive navigation
- Active route highlighting
- Mobile menu toggle
- Logout functionality

**Menu Items:**
- Dashboard
- Employees
- Departments
- Leave Management
- Onboard HR User

### Employee Sidebar
**File**: `components/employee-sidebar.tsx`

**Features:**
- Employee-specific navigation
- Profile quick access
- Leave balance display

**Menu Items:**
- Dashboard
- My Profile
- Request Leave
- Leave History

### Reusable Components
- `Card`: Content containers
- `Button`: Action buttons
- `Input`: Form inputs
- `Select`: Dropdown selects
- `Table`: Data tables
- `Dialog`: Modal dialogs
- `Badge`: Status indicators
- `Tabs`: Tabbed interfaces

---

## Workflows

### Employee Onboarding Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. HR fills employee form                                    │
│    - Personal details                                        │
│    - Employment details                                      │
│    - Department & Position                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. System generates employee ID                              │
│    - Auto-increment (EMP001, EMP002, etc.)                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Create employee record                                    │
│    - Insert into employees table                             │
│    - Set status to 'active'                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Create user account                                       │
│    - Create auth user                                        │
│    - Create profile with role 'employee'                     │
│    - Link user_id to employee record                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Initialize leave balances                                 │
│    - Create balances for all leave types                     │
│    - Prorate based on join date                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Send welcome email                                        │
│    - Email with login credentials                            │
│    - Temporary password                                      │
│    - Login link                                              │
└─────────────────────────────────────────────────────────────┘
```

### Leave Request Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Employee submits leave request                            │
│    - Select leave type                                       │
│    - Choose dates                                            │
│    - Provide reason                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. System validates request                                  │
│    - Check leave balance                                     │
│    - Validate dates                                          │
│    - Check overlapping requests                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Create leave request                                      │
│    - Status: 'pending'                                       │
│    - Update pending balance                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Notify manager/HR                                         │
│    - Email notification                                      │
│    - Dashboard notification                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. HR reviews request                                        │
│    - View employee details                                   │
│    - Check leave balance                                     │
│    - Review reason                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. HR approves/rejects                                       │
│    - Add comments                                            │
│    - Update status                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Update leave balance                                      │
│    - If approved: Move from pending to taken                 │
│    - If rejected: Remove from pending                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Notify employee                                           │
│    - Email with decision                                     │
│    - Include comments                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Configuration

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Application
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Email Templates

#### Welcome Email (Employee)
**Subject**: Welcome to [Company Name] - Your Login Credentials

**Template**:
```
Hi [First Name],

Welcome to [Company Name]! We're excited to have you join our team.

Your employee account has been created. Here are your login credentials:

Employee ID: [Employee ID]
Email: [Email]
Temporary Password: [Password]

Login here: [Login URL]

Please change your password after your first login.

Best regards,
HR Team
```

#### Leave Approved Email
**Subject**: Leave Request Approved

**Template**:
```
Hi [First Name],

Your leave request has been approved.

Leave Type: [Leave Type]
Duration: [Start Date] to [End Date]
Total Days: [Days]

Comments: [HR Comments]

Best regards,
HR Team
```

---

## Troubleshooting

### Common Issues

#### 1. Employee Not Receiving Credentials Email

**Symptoms:**
- Employee created successfully
- No email received

**Solutions:**
1. Check Resend API key is configured
2. Verify email address is correct
3. Check spam folder
4. Use "Resend Credentials" feature
5. Check Resend dashboard for delivery status

#### 2. Leave Balance Not Updating

**Symptoms:**
- Leave approved but balance unchanged

**Solutions:**
1. Check database triggers are enabled
2. Verify leave_balances table exists
3. Check RLS policies
4. Manually run balance update query

#### 3. Access Denied Errors

**Symptoms:**
- User redirected to /unauthorized

**Solutions:**
1. Verify user role in profiles table
2. Check middleware configuration
3. Clear browser cache and cookies
4. Re-login

#### 4. Employee ID Not Auto-Generating

**Symptoms:**
- Error when creating employee
- Duplicate employee ID

**Solutions:**
1. Check `generateEmployeeId()` function
2. Verify employees table has records
3. Check unique constraint on employee_id

### Debug Mode

Enable detailed logging:

```typescript
// In server actions
console.log("Debug: Employee data", employeeData)
console.log("Debug: User created", user)
```

### Database Queries for Debugging

```sql
-- Check employee count
SELECT COUNT(*) FROM employees;

-- Check leave balances
SELECT * FROM employee_leave_balances 
WHERE employee_id = 'uuid';

-- Check pending leaves
SELECT * FROM leave_requests 
WHERE status = 'pending';

-- Check user roles
SELECT email, role FROM profiles;
```

---

## Best Practices

### Security
1. Always use service role key for admin operations
2. Implement RLS policies on all tables
3. Validate input on both client and server
4. Use HTTPS in production
5. Rotate API keys regularly

### Performance
1. Use database indexes on frequently queried fields
2. Implement pagination for large datasets
3. Cache dashboard statistics
4. Optimize database queries
5. Use server-side rendering where appropriate

### Maintenance
1. Regular database backups
2. Monitor email delivery rates
3. Review and update leave policies annually
4. Archive old leave requests
5. Clean up terminated employee data

---

## Support & Resources

### Documentation
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Resend: https://resend.com/docs

### Contact
- Technical Support: tech@yourcompany.com
- HR Support: hr@yourcompany.com

---

**Last Updated**: March 7, 2026
**Version**: 1.0.0
