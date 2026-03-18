-- Ensure the trigger function exists (if not already created)
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Hero Content Table
CREATE TABLE IF NOT EXISTS public.hero_content (
    id INT PRIMARY KEY DEFAULT 1,
    title TEXT,
    subtitle TEXT,
    description TEXT,
    main_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT hero_content_singleton CHECK (id = 1)
);
DROP TRIGGER IF EXISTS set_hero_content_timestamp ON public.hero_content;
CREATE TRIGGER set_hero_content_timestamp
BEFORE UPDATE ON public.hero_content
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
INSERT INTO public.hero_content (id, title, subtitle, description, main_image_url)
VALUES (1, 'Welcome to Everspark', 'Illuminating Your Path to Success', 'We provide innovative solutions to spark your growth.', '/placeholder.svg?width=1200&height=600')
ON CONFLICT (id) DO NOTHING;

-- About Us Content Table
CREATE TABLE IF NOT EXISTS public.about_us_content (
    id INT PRIMARY KEY DEFAULT 1,
    page_title TEXT,
    subtitle TEXT,
    story_title TEXT,
    story_content TEXT,
    story_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT about_us_content_singleton CHECK (id = 1)
);
DROP TRIGGER IF EXISTS set_about_us_content_timestamp ON public.about_us_content;
CREATE TRIGGER set_about_us_content_timestamp
BEFORE UPDATE ON public.about_us_content
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
INSERT INTO public.about_us_content (id, page_title, subtitle, story_title, story_content, story_image_url)
VALUES (1, 'About Everspark', 'Our Journey, Mission, and Values', 'The Story of Innovation', 'Everspark was founded with a vision to bring cutting-edge solutions to businesses worldwide...', '/placeholder.svg?width=600&height=400')
ON CONFLICT (id) DO NOTHING;

-- Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    position TEXT,
    image_url TEXT,
    bio TEXT,
    sort_order INT DEFAULT 0, -- Ensuring sort_order column exists
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
DROP TRIGGER IF EXISTS set_team_members_timestamp ON public.team_members;
CREATE TRIGGER set_team_members_timestamp
BEFORE UPDATE ON public.team_members
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Services Page Content Table
CREATE TABLE IF NOT EXISTS public.services_page_content (
    id INT PRIMARY KEY DEFAULT 1,
    section_subtitle TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT services_page_content_singleton CHECK (id = 1)
);
DROP TRIGGER IF EXISTS set_services_page_content_timestamp ON public.services_page_content;
CREATE TRIGGER set_services_page_content_timestamp
BEFORE UPDATE ON public.services_page_content
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
INSERT INTO public.services_page_content (id, section_subtitle)
VALUES (1, 'Discover how our expert services can transform your business.')
ON CONFLICT (id) DO NOTHING;

-- Service Items Table
CREATE TABLE IF NOT EXISTS public.service_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
DROP TRIGGER IF EXISTS set_service_items_timestamp ON public.service_items;
CREATE TRIGGER set_service_items_timestamp
BEFORE UPDATE ON public.service_items
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Partner Items Table
CREATE TABLE IF NOT EXISTS public.partner_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
DROP TRIGGER IF EXISTS set_partner_items_timestamp ON public.partner_items;
CREATE TRIGGER set_partner_items_timestamp
BEFORE UPDATE ON public.partner_items
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Contact Info Content Table
CREATE TABLE IF NOT EXISTS public.contact_info_content (
    id INT PRIMARY KEY DEFAULT 1,
    address TEXT,
    city TEXT,
    country TEXT,
    main_phone TEXT,
    support_phone TEXT,
    email TEXT,
    map_url TEXT,
    social_media_links JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT contact_info_content_singleton CHECK (id = 1)
);
DROP TRIGGER IF EXISTS set_contact_info_content_timestamp ON public.contact_info_content;
CREATE TRIGGER set_contact_info_content_timestamp
BEFORE UPDATE ON public.contact_info_content
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
INSERT INTO public.contact_info_content (id, address, city, country, main_phone, support_phone, email, map_url, social_media_links)
VALUES (1, '123 Innovation Drive', 'Techville', 'CA', '555-123-4567', '555-987-6543', 'info@everspark.com', 'https://maps.google.com/q=Everspark', '{"facebook": "https://facebook.com/everspark", "twitter": "https://twitter.com/everspark", "linkedin": "https://linkedin.com/company/everspark"}')
ON CONFLICT (id) DO NOTHING;

-- Alter team_members table to add sort_order if it somehow was missed (belt-and-suspenders)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'team_members'
        AND column_name = 'sort_order'
    ) THEN
        ALTER TABLE public.team_members ADD COLUMN sort_order INT DEFAULT 0;
    END IF;
END $$;
