-- General Settings Table
CREATE TABLE IF NOT EXISTS public.general_settings (
    id INT PRIMARY KEY DEFAULT 1,
    site_name TEXT NOT NULL,
    site_description TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    timezone TEXT,
    language TEXT,
    site_logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT general_settings_singleton CHECK (id = 1)
);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS set_general_settings_timestamp ON public.general_settings;
CREATE TRIGGER set_general_settings_timestamp
BEFORE UPDATE ON public.general_settings
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Seed with default data if the table is empty
INSERT INTO public.general_settings (id, site_name, site_description, contact_email, contact_phone, address, timezone, language, site_logo_url)
VALUES (1, 'Ever Spark Technologies', 'Leading provider of electrochlorination, solar, and water disinfection solutions.', 'info@everspark.com', '+1 (555) 123-4567', '123 Technology Street, Tech City, TC 12345', 'America/New_York', 'en', '/placeholder.svg?width=150&height=50')
ON CONFLICT (id) DO NOTHING;
