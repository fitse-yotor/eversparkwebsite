CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- Consider making this a foreign key to a categories table later
    location TEXT NOT NULL,
    description TEXT,
    executive_summary TEXT,
    subtitle TEXT,
    main_image_url TEXT,
    video_url TEXT,
    rating NUMERIC(2, 1) DEFAULT 0.0,
    client TEXT,
    completed_date TEXT, -- Store as text for flexibility (e.g., "2023", "Q4 2023")
    tags TEXT[] DEFAULT '{}', -- Array of text tags
    status TEXT DEFAULT 'completed', -- e.g., 'planning', 'ongoing', 'completed', 'on-hold'
    featured BOOLEAN DEFAULT FALSE,
    sample_images TEXT[] DEFAULT '{}', -- Array of image URLs
    key_results TEXT[] DEFAULT '{}', -- Array of key result bullet points
    technical_specs JSONB DEFAULT '{}', -- JSON object for flexible key-value specs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add a trigger to update the updated_at column on each update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Optional: Add an index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects (slug);

-- Optional: Add an index for category filtering
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects (category);

-- Optional: Add an index for featured projects
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects (featured);
