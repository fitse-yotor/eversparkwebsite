# System Routes Guide

## 🔐 Authentication Routes

### Login (All Users)
- **URL**: `http://localhost:3000/login`
- **Description**: Unified login page for all user types (Admin, HR, Employee)
- **Auto-redirect**: After login, users are redirected based on their role:
  - Admin/Super Admin → `/admin`
  - HR → `/hr/dashboard`
  - Employee → `/employee/dashboard`

### Forgot Password
- **URL**: `http://localhost:3000/forgot-password`
- **Description**: Request password reset link via email

### Reset Password
- **URL**: `http://localhost:3000/reset-password`
- **Description**: Set new password (accessed via email link)

### Logout
- Users can logout from their respective dashboards using the logout button in the sidebar

---

## 👨‍💼 Admin Routes

### Base URL: `/admin`

### Dashboard & Management
- **Dashboard**: `/admin` or `/admin/dashboard`
- **Users Management**: `/admin/users`
- **Settings**: `/admin/settings`
- **Setup**: `/admin/setup`

### Content Management
- **Content**: `/admin/content`
- **Blogs**: `/admin/blogs`
- **Projects**: `/admin/projects`
- **Products**: `/admin/products`
- **Solutions**: `/admin/solutions`
- **Messages**: `/admin/messages`

### Testing
- **Test Connection**: `/admin/test-connection`

---

## 👥 HR Routes

### Base URL: `/hr`

### Dashboard
- **HR Dashboard**: `http://localhost:3000/hr/dashboard`
- **Description**: Overview of HR metrics (total employees, pending leaves, etc.)

### Employee Management
- **Employee List**: `http://localhost:3000/hr/employees`
- **Add Employee**: `http://localhost:3000/hr/employees/add`
- **View Employee**: `http://localhost:3000/hr/employees/[id]`
- **Edit Employee**: `http://localhost:3000/hr/employees/[id]/edit`

### Department Management
- **Department List**: `http://localhost:3000/hr/departments`
- **Add Department**: `http://localhost:3000/hr/departments/add`

### Leave Management
- **Leave Requests**: `http://localhost:3000/hr/leaves`
- **Description**: View and manage employee leave requests

### Onboarding
- **Onboarding**: `http://localhost:3000/hr/onboarding`
- **Description**: Employee onboarding interface

---

## 👤 Employee Routes

### Base URL: `/employee`

### Dashboard
- **Employee Dashboard**: `http://localhost:3000/employee/dashboard`
- **Description**: Employee personal dashboard

### Leave Management
- **Request Leave**: `http://localhost:3000/employee/leave/request`
- **Description**: Submit leave requests

---

## 🌐 Public Routes

### Website Pages
- **Home**: `http://localhost:3000/`
- **About**: `http://localhost:3000/about`
- **Contact**: `http://localhost:3000/contact`
- **Blogs**: `http://localhost:3000/blogs`
- **Blog Detail**: `http://localhost:3000/blogs/[id]`
- **Projects**: `http://localhost:3000/projects`
- **Project Detail**: `http://localhost:3000/projects/[id]`
- **Products**: `http://localhost:3000/products`
- **Product Category**: `http://localhost:3000/products/[categorySlug]`
- **Product Detail**: `http://localhost:3000/products/[categorySlug]/[productSlug]`
- **Solutions**: `http://localhost:3000/solutions`
- **Solution Detail**: `http://localhost:3000/solutions/[id]`

---

## 🔒 Access Control

### Role-Based Access

#### Admin/Super Admin
✅ Can access:
- All `/admin/*` routes
- Public routes

❌ Cannot access:
- `/hr/*` routes
- `/employee/*` routes

#### HR
✅ Can access:
- All `/hr/*` routes
- Public routes

❌ Cannot access:
- `/admin/*` routes
- `/employee/*` routes

#### Employee
✅ Can access:
- All `/employee/*` routes
- Public routes

❌ Cannot access:
- `/admin/*` routes
- `/hr/*` routes

### Unauthorized Access
- **URL**: `http://localhost:3000/unauthorized`
- **Description**: Shown when user tries to access routes they don't have permission for

---

## 📝 Quick Reference

### For Testing

#### Admin Login
```
URL: http://localhost:3000/login
Email: [admin-email]
Password: [admin-password]
Redirect: http://localhost:3000/admin
```

#### HR Login
```
URL: http://localhost:3000/login
Email: [hr-email]
Password: [hr-password]
Redirect: http://localhost:3000/hr/dashboard
```

#### Employee Login
```
URL: http://localhost:3000/login
Email: [employee-email]
Password: [employee-password]
Redirect: http://localhost:3000/employee/dashboard
```

---

## 🔄 Common Workflows

### HR: Add New Employee
1. Login at `/login`
2. Navigate to `/hr/employees`
3. Click "Add Employee"
4. Fill form at `/hr/employees/add`
5. Employee receives email with credentials
6. Employee can login at `/login`

### Employee: Request Leave
1. Login at `/login`
2. Navigate to `/employee/leave/request`
3. Submit leave request
4. HR reviews at `/hr/leaves`

### Admin: Manage Content
1. Login at `/login`
2. Navigate to `/admin/content`
3. Manage blogs, projects, products, solutions

### Password Reset (All Users)
1. Go to `/login`
2. Click "Forgot password?"
3. Enter email at `/forgot-password`
4. Check email for reset link
5. Click link → redirected to `/reset-password`
6. Set new password
7. Login at `/login`

---

## 🛡️ Security Features

### Middleware Protection
- All protected routes require authentication
- Role-based access control enforced
- Automatic redirect to `/login` if not authenticated
- Automatic redirect to `/unauthorized` if wrong role

### Session Management
- Secure session handling via Supabase
- Auto-logout on session expiry
- Remember me functionality

---

## 📱 API Routes

### Employee Management
- **GET** `/api/employees` - List all employees
- **POST** `/api/employees/onboard` - Create new employee

### HR Management
- **POST** `/api/hr/onboard` - HR user onboarding
- **GET** `/api/hr/users` - List HR users
- **DELETE** `/api/hr/users/[id]` - Delete HR user

### Contact
- **POST** `/api/contact` - Submit contact form

### Services
- **GET** `/api/services` - List services

### Messages
- **GET** `/api/messages` - List messages
- **GET** `/api/messages/[id]` - Get message details

### Upload
- **POST** `/api/upload` - File upload

### Test Email
- **POST** `/api/test-email` - Test email configuration

---

## 🎯 Production URLs

When deployed to production, replace `http://localhost:3000` with your production domain:

```
Production: https://yourdomain.com/login
Production: https://yourdomain.com/hr/dashboard
Production: https://yourdomain.com/employee/dashboard
Production: https://yourdomain.com/admin
```

---

## 📋 Route Summary Table

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public | Unified login for all users |
| `/forgot-password` | Public | Password reset request |
| `/reset-password` | Public | Set new password |
| `/admin/*` | Admin only | Admin dashboard and management |
| `/hr/*` | HR only | HR dashboard and employee management |
| `/employee/*` | Employee only | Employee dashboard and self-service |
| `/` | Public | Homepage |
| `/about` | Public | About page |
| `/contact` | Public | Contact page |
| `/blogs` | Public | Blog listing |
| `/projects` | Public | Projects listing |
| `/products` | Public | Products catalog |
| `/solutions` | Public | Solutions listing |

---

## 🔧 Development Notes

### Local Development
- Base URL: `http://localhost:3000`
- Port: 3000 (default Next.js)
- Hot reload enabled

### Environment Variables
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## ✅ Testing Checklist

- [ ] Admin can login and access `/admin`
- [ ] HR can login and access `/hr/dashboard`
- [ ] Employee can login and access `/employee/dashboard`
- [ ] Unauthorized access redirects properly
- [ ] Forgot password flow works
- [ ] Role-based redirects work after login
- [ ] Logout works from all dashboards
- [ ] Public routes accessible without login

---

**Note**: All routes are protected by middleware and role-based access control. Users will be automatically redirected to appropriate pages based on their authentication status and role.
