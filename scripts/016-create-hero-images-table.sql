-- Create hero_images table for slider functionality
CREATE TABLE IF NOT EXISTS hero_images (
  id SERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some default hero images
INSERT INTO hero_images (image_url, title, subtitle, description, sort_order, is_active) VALUES
('/placeholder.svg?height=600&width=1200', 'Welcome to EverSpark', 'Innovative Technology Solutions', 'Transforming businesses through cutting-edge technology and expert consulting services.', 1, true),
('/placeholder.svg?height=600&width=1200', 'Expert Team', 'Professional Excellence', 'Our experienced team delivers exceptional results for your business needs.', 2, true),
('/placeholder.svg?height=600&width=1200', 'Digital Transformation', 'Future-Ready Solutions', 'Leading your business into the digital age with innovative strategies and solutions.', 3, true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_hero_images_active_sort ON hero_images(is_active, sort_order);
