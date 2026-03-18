# Admin System - Complete Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Features](#features)
5. [User Roles & Access Control](#user-roles--access-control)
6. [Content Management](#content-management)
7. [API Endpoints](#api-endpoints)
8. [UI Components](#ui-components)
9. [Workflows](#workflows)
10. [Configuration](#configuration)
11. [Troubleshooting](#troubleshooting)

---

## System Overview

The Admin System is a comprehensive content management platform for managing a corporate website. It provides full control over website content including hero sections, products, projects, blogs, solutions, and customer messages.

### Key Capabilities
- Content management (Hero, About, Services, Partners, Contact)
- Product catalog management with categories
- Project portfolio management
- Blog management
- Solution showcase management
- Customer message handling
- File upload and media management
- Website settings configuration

### Technology Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **UI**: Tailwind CSS, shadcn/ui components
- **File Storage**: Supabase Storage / Custom Upload API

---

## Architecture

### System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Admin     │  │   Content    │  │   Products   │      │
│  │  Dashboard   │  │  Management  │  │  Management  │      │
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
```

### Folder Structure
```
app/
├── admin/                       # Admin Module
│   ├── dashboard/              # Admin Dashboard
│   ├── content/                # Content Management
│   │   ├── page.tsx           # Content Editor
│   │   └── actions.ts         # Content Actions
│   ├── products/               # Product Management
│   │   └── page.tsx           # Product CRUD
│   ├── projects/               # Project Management
│   ├── blogs/                  # Blog Management
│   ├── solutions/              # Solutions Management
│   ├── messages/               # Customer Messages
│   ├── settings/               # Website Settings
│   ├── users/                  # User Management
│   └── actions.ts              # Admin Actions
├── api/                         # API Routes
│   ├── contact/                # Contact Form API
│   ├── messages/               # Messages API
│   ├── services/               # Services API
│   └── upload/                 # File Upload API
components/
├── admin-sidebar.tsx           # Admin Navigation
├── product-category-management.tsx
├── product-inquiry-form.tsx
└── ui/                         # Reusable UI Components
scripts/
├── 002-create-content-tables.sql
├── 007-seed-product-data.sql
├── 012-create-blogs-table.sql
└── 013-create-projects-table.sql
```

---

## Database Schema

### Core Tables

#### 1. **hero_content**
Homepage hero section content.

```sql
CREATE TABLE hero_content (
  id INT PRIMARY KEY DEFAULT 1,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  main_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. **hero_images**
Hero slider images.

```sql
CREATE TABLE hero_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. **about_us_content**
About page content.

```sql
CREATE TABLE about_us_content (
  id INT PRIMARY KEY DEFAULT 1,
  page_title TEXT NOT NULL,
  subtitle TEXT,
  story_title TEXT,
  story_content TEXT,
  story_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. **team_members**
Team member profiles.

```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  image_url TEXT,
  bio TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5. **service_items**
Services offered.

```sql
CREATE TABLE service_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 6. **partner_items**
Partner/client logos.

```sql
CREATE TABLE partner_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 7. **contact_info_content**
Contact information.

```sql
CREATE TABLE contact_info_content (
  id INT PRIMARY KEY DEFAULT 1,
  address TEXT,
  city TEXT,
  country TEXT,
  main_phone TEXT,
  support_phone TEXT,
  email TEXT,
  map_url TEXT,
  social_media_links JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 8. **product_categories**
Product categories.

```sql
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 9. **products**
Product catalog.

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES product_categories(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  full_description TEXT,
  main_image_url TEXT,
  data_sheet_url TEXT,
  specifications JSONB,
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 10. **product_features**
Product feature list.

```sql
CREATE TABLE product_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  feature_text TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 11. **projects**
Project portfolio.

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  location TEXT,
  client TEXT,
  completion_date DATE,
  short_description TEXT,
  full_description TEXT,
  challenge TEXT,
  solution TEXT,
  results TEXT,
  main_image_url TEXT,
  gallery_images TEXT[],
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 12. **blogs**
Blog posts.

```sql
CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author TEXT,
  featured_image_url TEXT,
  category TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 13. **solutions**
Solution offerings.

```sql
CREATE TABLE solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 14. **solution_benefits**
Solution benefits/features.

```sql
CREATE TABLE solution_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id UUID REFERENCES solutions(id) ON DELETE CASCADE,
  benefit_text TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 15. **messages**
Customer inquiries.

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread',
  priority TEXT DEFAULT 'medium',
  category TEXT DEFAULT 'general',
  starred BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Status Values:**
- `unread`: New message
- `read`: Viewed by admin
- `replied`: Response sent
- `archived`: Archived

**Priority Values:**
- `low`: Low priority
- `medium`: Medium priority
- `high`: High priority

**Category Values:**
- `sales`: Sales inquiry
- `support`: Technical support
- `general`: General inquiry
- `partnership`: Partnership request

---

## Features

### 1. Dashboard

#### Admin Dashboard
**Location**: `/admin/dashboard`

**Metrics:**
- Total Products
- Total Projects
- Total Blogs
- Unread Messages

**Recent Activity:**
- Recent content updates
- New messages
- System notifications

**Top Categories:**
- Project categories with counts
- Product categories with counts

### 2. Content Management

#### Hero Section Management
**Location**: `/admin/content` (Hero Slider Tab)

**Features:**
- Add multiple hero images
- Set title, subtitle, description per image
- Sort order management
- Image upload
- Active/inactive toggle

**Workflow:**
1. Upload hero image
2. Add title and subtitle
3. Set sort order
4. Activate image
5. Preview on homepage

#### About Us Management
**Location**: `/admin/content` (About Us Tab)

**Features:**
- Page title and subtitle
- Story section with title and content
- Story image upload
- Team member management
  - Add/edit/delete team members
  - Name, position, bio, photo
  - Sort order

#### Services Management
**Location**: `/admin/content` (Services Tab)

**Features:**
- Services page subtitle
- Service items management
  - Add/edit/delete services
  - Title, description, icon
  - Sort order

#### Partners Management
**Location**: `/admin/content` (Partners Tab)

**Features:**
- Partner/client logos
- Add/edit/delete partners
- Name, logo, website URL, description
- Sort order

#### Contact Info Management
**Location**: `/admin/content` (Contact Info Tab)

**Features:**
- Address and location
- Phone numbers (main, support)
- Email address
- Map URL
- Social media links (Facebook, Twitter, LinkedIn)

### 3. Product Management

#### Product Catalog
**Location**: `/admin/products`

**Features:**
- View all products in grid layout
- Product cards with image, name, category
- Status badges (Active/Inactive, Featured)
- Quick actions: Edit, Toggle Status, Delete

#### Add Product
**Location**: `/admin/products` (Add New Product Tab)

**Features:**
- Product name and slug
- Category selection
- Short and full descriptions
- Main image upload
- Datasheet upload (PDF, DOC)
- Multiple features
- Specifications (key-value pairs)
- Featured toggle
- Status (Active/Inactive)

**Workflow:**
1. Fill product details
2. Upload images and datasheet
3. Add features
4. Add specifications
5. Set featured status
6. Save product

#### Edit Product
**Features:**
- Update all product fields
- Manage features
- Update specifications
- Change status
- Delete product

#### Product Category Management
**Location**: `/admin/products` (Manage Categories Tab)

**Features:**
- View all categories
- Add new category
- Edit category details
- Delete category
- Sort order management
- Category image upload

### 4. Project Management

#### Project Portfolio
**Location**: `/admin/projects`

**Features:**
- View all projects
- Project cards with image, title, category
- Status badges (Published/Draft, Featured)
- Quick actions: Edit, Toggle Status, Delete

#### Add/Edit Project
**Features:**
- Project title and slug
- Category, location, client
- Completion date
- Short and full descriptions
- Challenge, solution, results sections
- Main image upload
- Gallery images (multiple)
- Featured toggle
- Status (Published/Draft)

### 5. Blog Management

#### Blog Posts
**Location**: `/admin/blogs`

**Features:**
- View all blog posts
- Blog cards with featured image, title, excerpt
- Status badges (Published/Draft)
- Quick actions: Edit, Delete, Publish

#### Add/Edit Blog
**Features:**
- Blog title and slug
- Excerpt and full content
- Author name
- Featured image upload
- Category
- Tags (multiple)
- Status (Draft/Published)
- Publish date

### 6. Solutions Management

#### Solutions Showcase
**Location**: `/admin/solutions`

**Features:**
- View all solutions
- Solution cards with image, title, description
- Benefits list
- Featured toggle
- Quick actions: Edit, Delete

#### Add/Edit Solution
**Features:**
- Solution title
- Description
- Image upload
- Multiple benefits
- Featured toggle

### 7. Message Management

#### Customer Messages
**Location**: `/admin/messages`

**Features:**
- View all messages in list
- Filter by status (All, Unread, Read, Replied, Archived)
- Filter by category (Sales, Support, General, Partnership)
- Search by name or email
- Message details panel
- Quick actions: Star, Mark as Read, Archive, Delete

#### Message Details
**Features:**
- Contact information
- Message subject and content
- Status and priority badges
- Reply functionality
- Status update
- Archive/delete

**Workflow:**
1. Customer submits contact form
2. Message appears in admin panel
3. Admin reviews message
4. Admin replies via email
5. Status updated to "replied"
6. Message can be archived

### 8. Settings Management

#### Website Settings
**Location**: `/admin/settings`

**Features:**
- Site name and description
- Contact email and phone
- Address
- Timezone and language
- Site logo upload
- Social media links
- SEO settings
- Analytics configuration

---

## User Roles & Access Control

### Role Permissions

#### Super Admin
- Full system access
- Can access Admin and HR modules
- Can create admin users
- Can modify all settings

#### Admin
- Access to Admin module
- Can manage all content
- Can view and reply to messages
- Cannot create other admins

### Route Protection

```typescript
// Admin routes - accessible by admin, super_admin
if (path.startsWith('/admin/')) {
  if (!['admin', 'super_admin'].includes(userRole)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }
}
```

### RLS Policies

```sql
-- Admins can manage all content
CREATE POLICY "Admins can manage content" ON products
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Public can read published content
CREATE POLICY "Public can read published products" ON products
  FOR SELECT TO anon
  USING (status = 'active');
```

---

## Content Management

### Content Types

#### 1. Static Content
- Hero section
- About us
- Services
- Partners
- Contact info

**Management**: Direct edit in Content Management page

#### 2. Dynamic Content
- Products
- Projects
- Blogs
- Solutions

**Management**: CRUD operations with dedicated pages

#### 3. User-Generated Content
- Customer messages
- Product inquiries

**Management**: View and respond in Messages page

### Content Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Admin creates/edits content                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Content saved to database                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Revalidate affected pages                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Content appears on public website                         │
└─────────────────────────────────────────────────────────────┘
```

### File Upload

#### Upload API
**Endpoint**: `POST /api/upload`

**Request:**
```typescript
const formData = new FormData()
formData.append('file', file)
formData.append('type', 'image') // or 'datasheet', 'hero', etc.

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
})

const { url } = await response.json()
```

**Response:**
```json
{
  "url": "https://storage.example.com/uploads/image-123.jpg"
}
```

**Supported Types:**
- `image`: Product images, hero images, etc.
- `datasheet`: PDF, DOC files
- `hero`: Hero slider images
- `blog`: Blog featured images

---

## API Endpoints

### Content APIs

#### 1. Get Hero Data
```typescript
const heroData = await getHeroData()
```

#### 2. Update Hero Data
```typescript
const result = await updateHeroData({
  title: "Welcome",
  subtitle: "To our company",
  description: "We provide solutions",
  mainImageUrl: "https://..."
})
```

### Product APIs

#### 1. Get All Products
```typescript
const products = await getProducts()
```

#### 2. Add Product
```typescript
const result = await addProduct({
  slug: "product-name",
  name: "Product Name",
  category_id: "uuid",
  short_description: "Brief description",
  full_description: "Detailed description",
  main_image_url: "https://...",
  data_sheet_url: "https://...",
  featured: true,
  status: "active",
  specifications: { key: "value" },
  feature_texts: ["Feature 1", "Feature 2"]
})
```

#### 3. Update Product
```typescript
const result = await updateProduct(slug, productData)
```

#### 4. Delete Product
```typescript
const result = await deleteProduct(slug)
```

### Message APIs

#### 1. Get All Messages
```
GET /api/messages
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Product Inquiry",
    "message": "I'm interested in...",
    "status": "unread",
    "priority": "medium",
    "category": "sales",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### 2. Update Message
```
PATCH /api/messages/[id]
```

**Request Body:**
```json
{
  "status": "read",
  "priority": "high",
  "starred": true
}
```

#### 3. Delete Message
```
DELETE /api/messages/[id]
```

### Contact Form API

#### Submit Contact Form
```
POST /api/contact
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Inc",
  "phone": "+1234567890",
  "subject": "Product Inquiry",
  "message": "I'm interested in your products"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

---

## UI Components

### Admin Sidebar
**File**: `components/admin-sidebar.tsx`

**Features:**
- Responsive navigation
- Active route highlighting
- Mobile menu toggle
- Logout functionality

**Menu Items:**
- Dashboard
- Content
- Solutions
- Products
- Projects
- Blogs
- Messages
- Settings

### Product Category Management
**File**: `components/product-category-management.tsx`

**Features:**
- Category CRUD operations
- Drag-and-drop sorting
- Image upload
- Active/inactive toggle

### Product Inquiry Form
**File**: `components/product-inquiry-form.tsx`

**Features:**
- Product-specific inquiry form
- Form validation
- Email notification
- Success/error messages

---

## Workflows

### Product Management Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Admin navigates to Products page                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Click "Add New Product"                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Fill product form                                         │
│    - Basic details                                           │
│    - Upload images                                           │
│    - Add features                                            │
│    - Add specifications                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Save product                                              │
│    - Validate data                                           │
│    - Insert into database                                    │
│    - Create product_features records                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Revalidate pages                                          │
│    - Product listing page                                    │
│    - Product detail page                                     │
│    - Homepage (if featured)                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Product appears on website                                │
└─────────────────────────────────────────────────────────────┘
```

### Message Handling Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Customer submits contact form                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Message saved to database                                 │
│    - Status: unread                                          │
│    - Priority: medium                                        │
│    - Category: based on form                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Admin views message in Messages page                      │
│    - Message appears in Unread tab                           │
│    - Unread count increases                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Admin clicks message to view details                      │
│    - Status changes to "read"                                │
│    - Full message displayed                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Admin replies to message                                  │
│    - Compose reply                                           │
│    - Send email to customer                                  │
│    - Status changes to "replied"                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Admin archives message (optional)                         │
│    - Status changes to "archived"                            │
│    - Removed from active list                                │
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

# Application
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# File Upload (if using external service)
UPLOAD_API_KEY=your_upload_api_key
UPLOAD_BUCKET=your_bucket_name
```

### Database Initialization

Run migration scripts in order:

```bash
# Content tables
psql -f scripts/002-create-content-tables.sql

# Product tables and seed data
psql -f scripts/007-seed-product-data.sql

# Blog tables
psql -f scripts/012-create-blogs-table.sql

# Project tables
psql -f scripts/013-create-projects-table.sql
```

---

## Troubleshooting

### Common Issues

#### 1. Images Not Uploading

**Symptoms:**
- Upload button not working
- Error message on upload

**Solutions:**
1. Check file size limits
2. Verify upload API endpoint
3. Check storage bucket permissions
4. Verify file type is supported

#### 2. Content Not Appearing on Website

**Symptoms:**
- Content saved but not visible
- Old content still showing

**Solutions:**
1. Check content status (Active/Published)
2. Clear browser cache
3. Verify revalidatePath is called
4. Check RLS policies

#### 3. Messages Not Saving

**Symptoms:**
- Contact form submission fails
- No error message

**Solutions:**
1. Check API endpoint
2. Verify database connection
3. Check form validation
4. Review browser console for errors

#### 4. Dashboard Stats Not Updating

**Symptoms:**
- Counts not changing
- Stale data

**Solutions:**
1. Refresh page
2. Check database queries
3. Verify RLS policies
4. Clear cache

### Debug Queries

```sql
-- Check product count
SELECT COUNT(*) FROM products WHERE status = 'active';

-- Check unread messages
SELECT COUNT(*) FROM messages WHERE status = 'unread';

-- Check featured products
SELECT * FROM products WHERE featured = true;

-- Check recent projects
SELECT * FROM projects 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## Best Practices

### Content Management
1. Always preview content before publishing
2. Use descriptive slugs for SEO
3. Optimize images before upload
4. Keep descriptions concise and clear
5. Use featured flag strategically

### Product Management
1. Maintain consistent product naming
2. Include detailed specifications
3. Upload high-quality images
4. Keep datasheets up to date
5. Use categories effectively

### Message Management
1. Respond to messages promptly
2. Use priority flags appropriately
3. Archive old messages regularly
4. Track response times
5. Use categories for organization

### Performance
1. Optimize images (compress, resize)
2. Use CDN for static assets
3. Implement caching strategies
4. Paginate large lists
5. Lazy load images

### Security
1. Validate all user inputs
2. Sanitize content before display
3. Use RLS policies
4. Implement rate limiting
5. Regular security audits

---

## Support & Resources

### Documentation
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Tailwind CSS: https://tailwindcss.com/docs

### Contact
- Technical Support: tech@yourcompany.com
- Admin Support: admin@yourcompany.com

---

**Last Updated**: March 7, 2026
**Version**: 1.0.0
