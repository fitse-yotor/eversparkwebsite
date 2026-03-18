# Enterprise Management System

A comprehensive full-stack enterprise management platform built with Next.js 14, featuring HR Management, Content Management, and Employee Portal modules.

![Next.js](https://img.shields.io/badge/Next.js-15.2.6-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)

## 🌟 Overview

This enterprise-grade platform combines three powerful systems into one unified application:

- **HR Management System**: Complete employee lifecycle management with leave tracking
- **Admin Content Management**: Full-featured CMS for corporate website management
- **Employee Portal**: Self-service portal for employees to manage their profiles and requests

## ✨ Key Features

### 🏢 HR Management System

#### Employee Management
- **Complete Employee Lifecycle**
  - Automated onboarding with credential generation
  - Employee profile management (personal, employment, salary details)
  - Department and position assignment
  - Manager hierarchy tracking
  - Employee status management (active, on leave, probation, terminated)
  - Document management (contracts, certificates, IDs)

- **Smart Employee ID Generation**
  - Auto-increment employee IDs (EMP001, EMP002, etc.)
  - Unique identifier system

- **Automated Onboarding**
  - One-click employee creation
  - Automatic user account generation
  - Email credentials to new employees
  - Welcome email with login instructions
  - Automatic leave balance initialization

#### Leave Management
- **Comprehensive Leave System**
  - Multiple leave types (Annual, Sick, Casual, Maternity, Paternity, WFH, etc.)
  - Leave balance tracking per employee
  - Prorated leave allocation based on join date
  - Monthly leave accrual system
  - Half-day leave support

- **Approval Workflow**
  - Multi-level approval process
  - Manager and HR approval
  - Leave request history and audit trail
  - Email notifications for approvals/rejections
  - Comments and feedback system

- **Leave Policies**
  - Configurable leave types
  - Entitlement rules per employment type
  - Carry forward policies
  - Leave encashment support
  - Public holiday management

#### Department & Organization
- **Department Management**
  - Hierarchical department structure
  - Department head assignment
  - Budget tracking per department
  - Parent-child department relationships

- **Position Management**
  - Job title and role definitions
  - Salary range configuration
  - Responsibilities and requirements tracking
  - Department-position mapping

#### HR Dashboard
- **Real-time Analytics**
  - Total employee count
  - Pending leave requests
  - Employees on leave today
  - New hires this month
  - Recent activity feed

- **Quick Actions**
  - Add employee
  - View leave requests
  - Access reports
  - Manage departments

### 🎨 Admin Content Management System

#### Content Management
- **Hero Section Management**
  - Multiple hero slider images
  - Title, subtitle, and description per slide
  - Sort order management
  - Active/inactive toggle

- **About Us Management**
  - Company story and mission
  - Team member profiles with photos
  - Drag-and-drop team member ordering
  - Bio and position management

- **Services Management**
  - Service offerings with icons
  - Service descriptions
  - Sort order management

- **Partners & Clients**
  - Partner logo management
  - Website links
  - Partner descriptions

- **Contact Information**
  - Address and location details
  - Multiple phone numbers
  - Email configuration
  - Map integration
  - Social media links

#### Product Catalog
- **Product Management**
  - Product categories with images
  - Product CRUD operations
  - Short and full descriptions
  - Main image and gallery
  - Datasheet upload (PDF, DOC)
  - Product features list
  - Technical specifications (key-value pairs)
  - Featured product toggle
  - Active/inactive status

- **Category Management**
  - Category hierarchy
  - Category images
  - Sort order management
  - SEO-friendly slugs

#### Project Portfolio
- **Project Showcase**
  - Project case studies
  - Client and location details
  - Completion date tracking
  - Challenge-solution-results format
  - Image gallery
  - Featured projects
  - Category filtering

#### Blog Management
- **Blog System**
  - Rich text blog posts
  - Featured images
  - Author attribution
  - Categories and tags
  - Draft/published status
  - Publish date scheduling
  - SEO-friendly URLs

#### Solutions Management
- **Solution Offerings**
  - Solution descriptions
  - Benefits list
  - Solution images
  - Featured solutions

#### Message Management
- **Customer Inquiries**
  - Contact form submissions
  - Message categorization (Sales, Support, General, Partnership)
  - Priority levels (Low, Medium, High)
  - Status tracking (Unread, Read, Replied, Archived)
  - Star important messages
  - Reply functionality
  - Search and filter capabilities

#### Admin Dashboard
- **Analytics Overview**
  - Total products count
  - Total projects count
  - Total blog posts
  - Unread messages count
  - Recent activity feed
  - Top categories

### 👤 Employee Portal

#### Self-Service Features
- **Personal Dashboard**
  - Profile overview
  - Leave balance summary
  - Upcoming leaves
  - Recent activity

- **Leave Requests**
  - Submit leave requests
  - View leave history
  - Check leave balance
  - Cancel pending requests

- **Profile Management**
  - View personal information
  - Update contact details
  - View employment details
  - Access documents

## 🔐 Role-Based Access Control

### User Roles

#### Super Admin
- Full system access
- Access to both HR and Admin modules
- Can create admin and HR users
- System configuration access

#### Admin
- Access to Admin module
- Content management capabilities
- Can create HR users
- Cannot create other admins

#### HR
- Access to HR module only
- Employee management
- Leave approval/rejection
- Department management
- Cannot access admin functions

#### Employee
- Access to Employee portal only
- View own profile
- Request leave
- View leave balance
- Cannot access HR or Admin modules

### Security Features
- Row Level Security (RLS) policies
- Route-based access control
- Middleware authentication
- Session management
- Secure password handling
- Email verification

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15.2.6 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19
- **Styling**: Tailwind CSS 3.4
- **Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Date Handling**: date-fns
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes & Server Actions
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Email**: Resend API / Nodemailer

### DevOps & Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Analytics**: Vercel Analytics

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (or Supabase account)
- Resend API key (for emails)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/enterprise-management-system.git
   cd enterprise-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Email Configuration (Resend)
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=noreply@yourdomain.com

   # Application Configuration
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Set up the database**
   
   Run the migration scripts in order:
   ```bash
   # Content tables
   psql -h your_host -U your_user -d your_db -f scripts/002-create-content-tables.sql

   # Product tables
   psql -h your_host -U your_user -d your_db -f scripts/007-seed-product-data.sql

   # Blog tables
   psql -h your_host -U your_user -d your_db -f scripts/012-create-blogs-table.sql

   # Project tables
   psql -h your_host -U your_user -d your_db -f scripts/013-create-projects-table.sql

   # HR tables
   psql -h your_host -U your_user -d your_db -f scripts/019-create-hr-tables.sql
   ```

   Or if using Supabase, run the SQL scripts in the Supabase SQL Editor.

5. **Create the first admin user**
   ```bash
   node scripts/create-admin-user.js
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Usage

### First-Time Setup

1. **Login as Admin**
   - Navigate to `/login`
   - Use the admin credentials created in setup

2. **Create HR User** (Optional)
   - Go to `/hr/onboarding`
   - Fill in HR user details
   - HR user receives welcome email

3. **Add Employees**
   - Navigate to `/hr/employees/add`
   - Fill employee details
   - System generates employee ID
   - Employee receives login credentials via email

4. **Configure Content**
   - Go to `/admin/content`
   - Update hero section, about us, services, etc.
   - Add team members and partners

5. **Add Products**
   - Navigate to `/admin/products`
   - Create product categories
   - Add products with images and specifications

### Daily Operations

#### HR Operations
- **Employee Onboarding**: `/hr/employees/add`
- **Leave Approval**: `/hr/leaves`
- **Employee Management**: `/hr/employees`
- **Department Management**: `/hr/departments`

#### Admin Operations
- **Content Updates**: `/admin/content`
- **Product Management**: `/admin/products`
- **Blog Posts**: `/admin/blogs`
- **Customer Messages**: `/admin/messages`

#### Employee Operations
- **View Dashboard**: `/employee/dashboard`
- **Request Leave**: `/employee/leave/request`
- **View Profile**: `/employee/profile`

## 📁 Project Structure

```
├── app/                          # Next.js App Router
│   ├── admin/                   # Admin module
│   │   ├── dashboard/          # Admin dashboard
│   │   ├── content/            # Content management
│   │   ├── products/           # Product management
│   │   ├── projects/           # Project management
│   │   ├── blogs/              # Blog management
│   │   ├── solutions/          # Solutions management
│   │   ├── messages/           # Message management
│   │   └── settings/           # Settings
│   ├── hr/                      # HR module
│   │   ├── dashboard/          # HR dashboard
│   │   ├── employees/          # Employee management
│   │   ├── departments/        # Department management
│   │   ├── leaves/             # Leave management
│   │   └── onboarding/         # HR onboarding
│   ├── employee/                # Employee portal
│   │   ├── dashboard/          # Employee dashboard
│   │   └── leave/              # Leave requests
│   ├── api/                     # API routes
│   │   ├── employees/          # Employee APIs
│   │   ├── hr/                 # HR APIs
│   │   ├── messages/           # Message APIs
│   │   └── upload/             # File upload API
│   ├── auth/                    # Authentication
│   ├── login/                   # Login page
│   └── unauthorized/            # Unauthorized access page
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── admin-sidebar.tsx       # Admin navigation
│   ├── hr-sidebar.tsx          # HR navigation
│   └── employee-sidebar.tsx    # Employee navigation
├── lib/                         # Utility libraries
│   ├── auth.ts                 # Authentication utilities
│   ├── email-service.ts        # Email service
│   └── supabase/               # Supabase clients
├── scripts/                     # Database migration scripts
│   ├── 002-create-content-tables.sql
│   ├── 007-seed-product-data.sql
│   ├── 012-create-blogs-table.sql
│   ├── 013-create-projects-table.sql
│   └── 019-create-hr-tables.sql
├── middleware.ts                # Route protection middleware
└── package.json                 # Dependencies
```

## 🔧 Configuration

### Email Configuration

The system uses Resend for email delivery. Configure in `.env.local`:

```env
RESEND_API_KEY=your_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### Database Configuration

Using Supabase:
1. Create a Supabase project
2. Copy the project URL and keys
3. Run migration scripts in SQL Editor
4. Enable Row Level Security (RLS)

### File Upload Configuration

Configure file upload limits and storage:
- Maximum file size: 10MB (configurable)
- Supported formats: Images (JPG, PNG, WebP), Documents (PDF, DOC, DOCX)
- Storage: Supabase Storage or custom solution

## 📊 Database Schema

### HR Tables
- `employees` - Employee master data
- `departments` - Department structure
- `positions` - Job positions
- `leave_types` - Leave type definitions
- `leave_policies` - Leave entitlement rules
- `leave_requests` - Leave applications
- `employee_leave_balances` - Leave balance tracking
- `employee_documents` - Document storage
- `public_holidays` - Holiday calendar

### Admin Tables
- `hero_content` - Hero section
- `hero_images` - Hero slider
- `about_us_content` - About page
- `team_members` - Team profiles
- `service_items` - Services
- `partner_items` - Partners
- `contact_info_content` - Contact info
- `products` - Product catalog
- `product_categories` - Product categories
- `product_features` - Product features
- `projects` - Project portfolio
- `blogs` - Blog posts
- `solutions` - Solutions
- `solution_benefits` - Solution benefits
- `messages` - Customer messages

### Auth Tables
- `profiles` - User profiles with roles

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env.local` to version control
2. **API Keys**: Rotate keys regularly
3. **Database**: Use Row Level Security (RLS) policies
4. **Authentication**: Implement session timeout
5. **Input Validation**: Validate all user inputs
6. **File Upload**: Scan uploaded files for malware
7. **HTTPS**: Always use HTTPS in production
8. **Rate Limiting**: Implement API rate limiting

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Build test
npm run build
```

## 📈 Performance Optimization

- Server-side rendering (SSR) for dynamic content
- Static generation for public pages
- Image optimization with Next.js Image
- Database query optimization with indexes
- Caching strategies for frequently accessed data
- Lazy loading for large components

## 🐛 Troubleshooting

### Common Issues

**Issue**: Employee not receiving credentials email
- Check Resend API key configuration
- Verify email address is correct
- Check spam folder
- Use "Resend Credentials" feature

**Issue**: Leave balance not updating
- Check database triggers are enabled
- Verify RLS policies
- Check leave_balances table

**Issue**: Access denied errors
- Verify user role in profiles table
- Check middleware configuration
- Clear browser cache and re-login

See [HR_SYSTEM_DOCUMENTATION.md](./HR_SYSTEM_DOCUMENTATION.md) and [ADMIN_SYSTEM_DOCUMENTATION.md](./ADMIN_SYSTEM_DOCUMENTATION.md) for detailed troubleshooting guides.

## 📚 Documentation

- [HR System Documentation](./HR_SYSTEM_DOCUMENTATION.md) - Complete HR module guide
- [Admin System Documentation](./ADMIN_SYSTEM_DOCUMENTATION.md) - Complete Admin module guide
- [System Routes Guide](./SYSTEM_ROUTES_GUIDE.md) - All available routes
- [Role-Based Access Control](./ROLE_BASED_ACCESS_CONTROL.md) - Security and permissions

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Use TypeScript for type safety
- Follow ESLint rules
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Lucide](https://lucide.dev/) - Icon library
- [Resend](https://resend.com/) - Email API

## 📞 Support

For support, email support@yourcompany.com or open an issue in the GitHub repository.

## 🗺️ Roadmap

### Upcoming Features
- [ ] Payroll management system
- [ ] Performance review module
- [ ] Attendance tracking with biometric integration
- [ ] Training and development module
- [ ] Recruitment and applicant tracking
- [ ] Employee self-service mobile app
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Export to Excel/PDF

### Version History
- **v1.0.0** (Current) - Initial release with HR and Admin modules
  - Employee management
  - Leave management
  - Content management
  - Product catalog
  - Blog system
  - Message handling

---

**Built with ❤️ using Next.js and Supabase**

⭐ Star this repository if you find it helpful!
