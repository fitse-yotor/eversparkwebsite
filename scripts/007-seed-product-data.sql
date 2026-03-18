-- First, create the product_features and product_related_products tables
CREATE TABLE IF NOT EXISTS product_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    feature_text TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_related_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id_left UUID REFERENCES products(id) ON DELETE CASCADE,
    product_id_right UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id_left, product_id_right)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_features_product_id ON product_features(product_id);
CREATE INDEX IF NOT EXISTS idx_product_features_sort_order ON product_features(sort_order);
CREATE INDEX IF NOT EXISTS idx_product_related_left ON product_related_products(product_id_left);
CREATE INDEX IF NOT EXISTS idx_product_related_right ON product_related_products(product_id_right);

-- Clear existing data to ensure clean seed
DELETE FROM product_related_products;
DELETE FROM product_features;
DELETE FROM products;
DELETE FROM product_categories;

-- Insert product categories
INSERT INTO product_categories (name, description, slug) VALUES
('Electrochlorination Systems', 'Advanced electrochlorination systems for water treatment', 'electrochlorination'),
('Solar Water Treatment', 'Solar-powered water treatment solutions', 'solar-treatment'),
('Industrial Solutions', 'Industrial-grade water treatment systems', 'industrial'),
('Residential Systems', 'Home water treatment solutions', 'residential')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- Get category IDs for reference
DO $$
DECLARE
    electrochlorination_id UUID;
    solar_id UUID;
    industrial_id UUID;
    residential_id UUID;
    
    -- Product IDs
    es5000_id UUID;
    wata_mini_id UUID;
    aquasafe_id UUID;
    pureclean_id UUID;
    hydromax_id UUID;
    ecoflow_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO electrochlorination_id FROM product_categories WHERE slug = 'electrochlorination';
    SELECT id INTO solar_id FROM product_categories WHERE slug = 'solar-treatment';
    SELECT id INTO industrial_id FROM product_categories WHERE slug = 'industrial';
    SELECT id INTO residential_id FROM product_categories WHERE slug = 'residential';

    -- Insert products
    INSERT INTO products (category_id, name, slug, short_description, full_description, main_image_url, data_sheet_url, specifications, featured, status) VALUES
    (electrochlorination_id, 'ES-5000 Electrochlorination System', 'es-5000', 
     'High-capacity electrochlorination system for large-scale water treatment facilities.',
     'The ES-5000 is our flagship electrochlorination system designed for municipal water treatment plants and large industrial facilities. It produces sodium hypochlorite on-site through the electrolysis of salt water, eliminating the need for hazardous chemical storage and transportation.',
     '/placeholder.svg?height=400&width=600',
     '/datasheets/es-5000.pdf',
     '{"capacity": "5000 L/day", "power": "50 kW", "efficiency": "95%", "dimensions": "2.5m x 1.5m x 2m", "weight": "800 kg"}',
     true, 'active'),
     
    (solar_id, 'WATA Mini Solar Water Treatment', 'wata-mini',
     'Compact solar-powered water treatment system for remote communities.',
     'The WATA Mini is a revolutionary solar-powered water treatment system that combines electrochlorination with solar energy. Perfect for remote communities, emergency response, and off-grid applications where reliable power supply is limited.',
     '/placeholder.svg?height=400&width=600',
     '/datasheets/wata-mini.pdf',
     '{"capacity": "500 L/day", "power": "Solar + Battery", "efficiency": "90%", "dimensions": "1m x 0.8m x 1.2m", "weight": "150 kg"}',
     true, 'active'),
     
    (residential_id, 'AquaSafe Home System', 'aquasafe-home',
     'Complete home water treatment solution with advanced filtration.',
     'The AquaSafe Home System provides comprehensive water treatment for residential use. It combines multiple filtration stages with UV sterilization to ensure safe, clean drinking water for your family.',
     '/placeholder.svg?height=400&width=600',
     '/datasheets/aquasafe-home.pdf',
     '{"capacity": "50 L/hour", "power": "2 kW", "efficiency": "99%", "dimensions": "0.6m x 0.4m x 1m", "weight": "45 kg"}',
     true, 'active'),
     
    (industrial_id, 'PureClean Industrial', 'pureclean-industrial',
     'Heavy-duty water treatment system for industrial applications.',
     'The PureClean Industrial system is engineered for demanding industrial environments. It handles high-volume water treatment with robust construction and automated monitoring systems.',
     '/placeholder.svg?height=400&width=600',
     '/datasheets/pureclean-industrial.pdf',
     '{"capacity": "10000 L/day", "power": "75 kW", "efficiency": "92%", "dimensions": "3m x 2m x 2.5m", "weight": "1200 kg"}',
     false, 'active'),
     
    (electrochlorination_id, 'HydroMax Pro', 'hydromax-pro',
     'Professional-grade electrochlorination for medium-scale facilities.',
     'The HydroMax Pro bridges the gap between small and large-scale systems. Ideal for hotels, hospitals, and medium-sized industrial facilities requiring reliable water treatment.',
     '/placeholder.svg?height=400&width=600',
     '/datasheets/hydromax-pro.pdf',
     '{"capacity": "2000 L/day", "power": "25 kW", "efficiency": "93%", "dimensions": "1.8m x 1.2m x 1.8m", "weight": "400 kg"}',
     false, 'active'),
     
    (solar_id, 'EcoFlow Solar', 'ecoflow-solar',
     'Sustainable solar water treatment for eco-conscious applications.',
     'EcoFlow Solar represents the future of sustainable water treatment. This system harnesses solar energy to provide clean water while minimizing environmental impact.',
     '/placeholder.svg?height=400&width=600',
     '/datasheets/ecoflow-solar.pdf',
     '{"capacity": "1000 L/day", "power": "Solar + Grid Backup", "efficiency": "88%", "dimensions": "1.5m x 1m x 1.5m", "weight": "250 kg"}',
     false, 'active');

    -- Get product IDs for features and relationships
    SELECT id INTO es5000_id FROM products WHERE slug = 'es-5000';
    SELECT id INTO wata_mini_id FROM products WHERE slug = 'wata-mini';
    SELECT id INTO aquasafe_id FROM products WHERE slug = 'aquasafe-home';
    SELECT id INTO pureclean_id FROM products WHERE slug = 'pureclean-industrial';
    SELECT id INTO hydromax_id FROM products WHERE slug = 'hydromax-pro';
    SELECT id INTO ecoflow_id FROM products WHERE slug = 'ecoflow-solar';

    -- Insert product features
    -- ES-5000 features
    INSERT INTO product_features (product_id, feature_text, sort_order) VALUES
    (es5000_id, 'High-capacity sodium hypochlorite production', 0),
    (es5000_id, 'Automated monitoring and control system', 1),
    (es5000_id, 'Corrosion-resistant titanium electrodes', 2),
    (es5000_id, 'Remote monitoring capabilities', 3),
    (es5000_id, 'Low maintenance requirements', 4);

    -- WATA Mini features
    INSERT INTO product_features (product_id, feature_text, sort_order) VALUES
    (wata_mini_id, '100% solar-powered operation', 0),
    (wata_mini_id, 'Portable and easy to install', 1),
    (wata_mini_id, 'Battery backup for continuous operation', 2),
    (wata_mini_id, 'Perfect for remote locations', 3),
    (wata_mini_id, 'Minimal maintenance required', 4);

    -- AquaSafe features
    INSERT INTO product_features (product_id, feature_text, sort_order) VALUES
    (aquasafe_id, 'Multi-stage filtration system', 0),
    (aquasafe_id, 'UV sterilization technology', 1),
    (aquasafe_id, 'Compact design for home use', 2),
    (aquasafe_id, 'Easy filter replacement', 3),
    (aquasafe_id, 'Real-time water quality monitoring', 4);

    -- PureClean features
    INSERT INTO product_features (product_id, feature_text, sort_order) VALUES
    (pureclean_id, 'Heavy-duty construction', 0),
    (pureclean_id, 'High-volume processing capability', 1),
    (pureclean_id, 'Automated chemical dosing', 2),
    (pureclean_id, 'Industrial-grade components', 3),
    (pureclean_id, '24/7 monitoring system', 4);

    -- HydroMax features
    INSERT INTO product_features (product_id, feature_text, sort_order) VALUES
    (hydromax_id, 'Medium-scale capacity', 0),
    (hydromax_id, 'Energy-efficient operation', 1),
    (hydromax_id, 'Modular design', 2),
    (hydromax_id, 'Easy maintenance access', 3),
    (hydromax_id, 'Digital control interface', 4);

    -- EcoFlow features
    INSERT INTO product_features (product_id, feature_text, sort_order) VALUES
    (ecoflow_id, 'Eco-friendly solar operation', 0),
    (ecoflow_id, 'Grid backup capability', 1),
    (ecoflow_id, 'Smart energy management', 2),
    (ecoflow_id, 'Weather-resistant design', 3),
    (ecoflow_id, 'Carbon footprint reduction', 4);

    -- Insert related products relationships
    INSERT INTO product_related_products (product_id_left, product_id_right) VALUES
    (es5000_id, hydromax_id),
    (es5000_id, pureclean_id),
    (wata_mini_id, ecoflow_id),
    (wata_mini_id, aquasafe_id),
    (aquasafe_id, wata_mini_id),
    (pureclean_id, es5000_id),
    (hydromax_id, es5000_id),
    (hydromax_id, pureclean_id),
    (ecoflow_id, wata_mini_id)
    ON CONFLICT DO NOTHING;

END $$;
