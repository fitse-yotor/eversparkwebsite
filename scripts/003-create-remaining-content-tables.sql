-- Ensure the trigger function exists (if not already created)
    CREATE OR REPLACE FUNCTION trigger_set_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

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

    -- Trigger for partner_items
    DROP TRIGGER IF EXISTS set_partner_items_timestamp ON public.partner_items;
    CREATE TRIGGER set_partner_items_timestamp
    BEFORE UPDATE ON public.partner_items
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

    -- Contact Info Table (Singleton)
    CREATE TABLE IF NOT EXISTS public.contact_info_content (
        id INT PRIMARY KEY DEFAULT 1, -- Ensures only one row for contact info
        address TEXT,
        city TEXT,
        country TEXT,
        main_phone TEXT,
        support_phone TEXT,
        email TEXT,
        map_url TEXT,
        social_media_links JSONB, -- For storing { facebook, twitter, linkedin }
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT contact_info_content_singleton CHECK (id = 1)
    );

    -- Trigger for contact_info_content
    DROP TRIGGER IF EXISTS set_contact_info_content_timestamp ON public.contact_info_content;
    CREATE TRIGGER set_contact_info_content_timestamp
    BEFORE UPDATE ON public.contact_info_content
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

    -- Seed initial contact info if the table is empty and the row doesn't exist
    INSERT INTO public.contact_info_content (id, address, city, country, main_phone, support_phone, email, map_url, social_media_links)
    VALUES (
        1,
        '123 Everspark Avenue',
        'Innovation City',
        'Techland',
        '555-0100',
        '555-0101',
        'contact@everspark.com',
        'https://maps.example.com/everspark',
        '{"facebook": "https://facebook.com/everspark", "twitter": "https://twitter.com/everspark", "linkedin": "https://linkedin.com/company/everspark"}'
    ) ON CONFLICT (id) DO NOTHING;

    -- Also, ensure hero_content table exists as it's fetched in the same useEffect
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

    -- Trigger for hero_content
    DROP TRIGGER IF EXISTS set_hero_content_timestamp ON public.hero_content;
    CREATE TRIGGER set_hero_content_timestamp
    BEFORE UPDATE ON public.hero_content
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

    INSERT INTO public.hero_content (id, title, subtitle, description, main_image_url)
    VALUES (
        1,
        'Default Hero Title',
        'Default Hero Subtitle',
        'Default hero description text.',
        '/placeholder.svg?width=1200&height=600'
    ) ON CONFLICT (id) DO NOTHING;


    -- And about_us_content table
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
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

    INSERT INTO public.about_us_content (id, page_title, subtitle, story_title, story_content, story_image_url)
    VALUES (
        1,
        'About Everspark',
        'Our Journey and Vision',
        'The Everspark Story',
        'Detailed content about the company story...',
        '/placeholder.svg?width=600&height=400'
    ) ON CONFLICT (id) DO NOTHING;

    -- And team_members table
    CREATE TABLE IF NOT EXISTS public.team_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        position TEXT,
        image_url TEXT,
        bio TEXT,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    DROP TRIGGER IF EXISTS set_team_members_timestamp ON public.team_members;
    CREATE TRIGGER set_team_members_timestamp
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

    -- And services_page_content table
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
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

    INSERT INTO public.services_page_content (id, section_subtitle)
    VALUES (
        1,
        'Explore the range of services we offer.'
    ) ON CONFLICT (id) DO NOTHING;
