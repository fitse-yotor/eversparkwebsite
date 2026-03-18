-- Fix RLS policies for messages table to allow anonymous inserts
DROP POLICY IF EXISTS "Allow public insert to messages" ON messages;
DROP POLICY IF EXISTS "Allow authenticated users to manage messages" ON messages;
DROP POLICY IF EXISTS "Allow service role full access to messages" ON messages;

-- Create new policies
CREATE POLICY "Allow anonymous insert to messages" ON messages 
    FOR INSERT 
    TO anon 
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to messages" ON messages 
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Allow service role full access to messages" ON messages 
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);
