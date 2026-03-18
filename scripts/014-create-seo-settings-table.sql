-- Create SEO settings table
CREATE TABLE IF NOT EXISTS seo_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    meta_title TEXT NOT NULL DEFAULT '',
    meta_description TEXT NOT NULL DEFAULT '',
    meta_keywords TEXT NOT NULL DEFAULT '',
    google_analytics_id TEXT NOT NULL DEFAULT '',
    google_search_console TEXT NOT NULL DEFAULT '',
    robots_txt TEXT NOT NULL DEFAULT 'User-agent: *\nDisallow: /admin/\nSitemap: https://everspark.com/sitemap.xml',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default SEO settings
INSERT INTO seo_settings (id, meta_title, meta_description, meta_keywords, google_analytics_id, google_search_console, robots_txt)
VALUES (
    1,
    'Ever Spark Technologies - Water Treatment Solutions',
    'Leading provider of electrochlorination, solar, and water disinfection solutions for communities worldwide.',
    'water treatment, electrochlorination, solar water systems, water disinfection',
    '',
    '',
    'User-agent: *\nDisallow: /admin/\nSitemap: https://everspark.com/sitemap.xml'
)
ON CONFLICT (id) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_seo_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_seo_settings_updated_at
    BEFORE UPDATE ON seo_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_seo_settings_updated_at();
