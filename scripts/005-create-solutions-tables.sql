-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Solutions Table
CREATE TABLE IF NOT EXISTS solutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for solutions table to auto-update 'updated_at'
DROP TRIGGER IF EXISTS solutions_updated_at_trigger ON solutions; -- Drop if exists to avoid conflict
CREATE TRIGGER solutions_updated_at_trigger
BEFORE UPDATE ON solutions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Solution Benefits Table
CREATE TABLE IF NOT EXISTS solution_benefits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    solution_id UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
    benefit_text TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for solution_benefits table to auto-update 'updated_at'
DROP TRIGGER IF EXISTS solution_benefits_updated_at_trigger ON solution_benefits; -- Drop if exists
CREATE TRIGGER solution_benefits_updated_at_trigger
BEFORE UPDATE ON solution_benefits
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add some initial sample data (optional, uncomment to use)
/*
DO $$
DECLARE
    solution_id_1 UUID;
    solution_id_2 UUID;
BEGIN
    -- Insert Sample Solution 1
    INSERT INTO solutions (title, description, image_url, featured)
    VALUES (
        'Cloud Migration & Modernization',
        'Seamlessly transition your legacy systems to the cloud or modernize your existing cloud infrastructure for optimal performance, scalability, and cost-efficiency. We support AWS, Azure, and Google Cloud.',
        '/placeholder.svg?width=800&height=600',
        TRUE
    ) RETURNING id INTO solution_id_1;

    -- Insert Benefits for Sample Solution 1
    INSERT INTO solution_benefits (solution_id, benefit_text, sort_order)
    VALUES
        (solution_id_1, 'Reduced operational costs and TCO', 0),
        (solution_id_1, 'Enhanced scalability and flexibility', 1),
        (solution_id_1, 'Improved security and compliance', 2),
        (solution_id_1, 'Faster time-to-market for new features', 3);

    -- Insert Sample Solution 2
    INSERT INTO solutions (title, description, image_url, featured)
    VALUES (
        'AI-Powered Data Analytics',
        'Unlock the power of your data with our advanced AI and machine learning solutions. Gain actionable insights, predict trends, and automate decision-making processes.',
        '/placeholder.svg?width=800&height=600',
        FALSE
    ) RETURNING id INTO solution_id_2;

    -- Insert Benefits for Sample Solution 2
    INSERT INTO solution_benefits (solution_id, benefit_text, sort_order)
    VALUES
        (solution_id_2, 'Data-driven decision making', 0),
        (solution_id_2, 'Predictive insights and forecasting', 1),
        (solution_id_2, 'Automation of complex tasks', 2),
        (solution_id_2, 'Personalized customer experiences', 3);
END $$;
*/

-- Grant usage on schema and tables to supabase_functions_admin if it exists, or anon and authenticated
-- This is important for RLS and function access
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_functions_admin') THEN
    GRANT USAGE ON SCHEMA public TO supabase_functions_admin;
    GRANT ALL ON TABLE solutions TO supabase_functions_admin;
    GRANT ALL ON TABLE solution_benefits TO supabase_functions_admin;
  END IF;
  
  GRANT SELECT ON TABLE solutions TO anon, authenticated;
  GRANT INSERT ON TABLE solutions TO authenticated; -- Or specific role if needed
  GRANT UPDATE ON TABLE solutions TO authenticated; -- Or specific role
  GRANT DELETE ON TABLE solutions TO authenticated; -- Or specific role

  GRANT SELECT ON TABLE solution_benefits TO anon, authenticated;
  GRANT INSERT ON TABLE solution_benefits TO authenticated; -- Or specific role
  GRANT UPDATE ON TABLE solution_benefits TO authenticated; -- Or specific role
  GRANT DELETE ON TABLE solution_benefits TO authenticated; -- Or specific role
END $$;


-- Enable RLS for the tables if not already enabled
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_benefits ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (adjust as needed for your specific security requirements)
-- Allow public read access
DROP POLICY IF EXISTS "Public read access for solutions" ON solutions;
CREATE POLICY "Public read access for solutions" ON solutions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for solution_benefits" ON solution_benefits;
CREATE POLICY "Public read access for solution_benefits" ON solution_benefits
  FOR SELECT USING (true);

-- Allow authenticated users to manage their own data (example, adjust if solutions are not user-specific)
-- For now, assuming admins (or a specific role) will manage solutions via service_role key from server-side actions.
-- If you need users to manage solutions they "own", you'd add a user_id column and policies based on auth.uid().

-- Example: Allow users with a specific role 'admin' to do anything.
-- This is often handled by using the service_role key on the server, which bypasses RLS.
-- If you want fine-grained RLS for admins:
/*
DROP POLICY IF EXISTS "Admins can manage solutions" ON solutions;
CREATE POLICY "Admins can manage solutions" ON solutions
  FOR ALL
  USING (auth.role() = 'admin') -- Replace 'admin' with your actual admin role name if you have one
  WITH CHECK (auth.role() = 'admin');

DROP POLICY IF EXISTS "Admins can manage solution_benefits" ON solution_benefits;
CREATE POLICY "Admins can manage solution_benefits" ON solution_benefits
  FOR ALL
  USING (auth.role() = 'admin')
  WITH CHECK (auth.role() = 'admin');
*/

-- If your server-side actions use the service_role key (which they do by default with createSupabaseServerClient()),
-- these RLS policies for insert/update/delete are primarily for client-side operations or if you switch to user-impersonated calls.
-- For server actions, the service_role bypasses RLS.
-- However, SELECT policies are still important for public/authenticated reads.

-- For INSERT/UPDATE/DELETE by authenticated users (if not using service_role for these from client)
DROP POLICY IF EXISTS "Authenticated users can insert solutions" ON solutions;
CREATE POLICY "Authenticated users can insert solutions" ON solutions
  FOR INSERT TO authenticated WITH CHECK (true); -- Or more specific checks

DROP POLICY IF EXISTS "Authenticated users can update solutions" ON solutions;
CREATE POLICY "Authenticated users can update solutions" ON solutions
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true); -- Or more specific checks

DROP POLICY IF EXISTS "Authenticated users can delete solutions" ON solutions;
CREATE POLICY "Authenticated users can delete solutions" ON solutions
  FOR DELETE TO authenticated USING (true); -- Or more specific checks


DROP POLICY IF EXISTS "Authenticated users can insert solution_benefits" ON solution_benefits;
CREATE POLICY "Authenticated users can insert solution_benefits" ON solution_benefits
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update solution_benefits" ON solution_benefits;
CREATE POLICY "Authenticated users can update solution_benefits" ON solution_benefits
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete solution_benefits" ON solution_benefits;
CREATE POLICY "Authenticated users can delete solution_benefits" ON solution_benefits
  FOR DELETE TO authenticated USING (true);


SELECT 'Solutions and Solution Benefits tables, triggers, and RLS policies created/updated successfully.' AS status;
