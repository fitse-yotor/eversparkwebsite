CREATE TABLE IF NOT EXISTS public.blogs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    slug text UNIQUE NOT NULL,
    excerpt text,
    content text,
    author text,
    published_date date,
    read_time text,
    image_url text,
    tags text[],
    category text NOT NULL,
    category_name text NOT NULL,
    featured boolean DEFAULT FALSE,
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies for blogs table
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Policy for public access (read-only for published blogs)
DROP POLICY IF EXISTS "Public can read blogs" ON public.blogs;
CREATE POLICY "Public can read blogs" ON public.blogs FOR SELECT TO anon USING (status = 'published');

-- Policy for admin users (full CRUD)
DROP POLICY IF EXISTS "Admins can manage blogs" ON public.blogs;
CREATE POLICY "Admins can manage blogs" ON public.blogs
    FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'));

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function on update
DROP TRIGGER IF EXISTS public.set_updated_at ON public.blogs;
CREATE TRIGGER public.set_updated_at
BEFORE UPDATE ON public.blogs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
