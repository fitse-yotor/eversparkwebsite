-- Make sure the trigger function exists (if not already created)
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Trigger for service_items
DROP TRIGGER IF EXISTS set_service_items_timestamp ON public.service_items;
CREATE TRIGGER set_service_items_timestamp
BEFORE UPDATE ON public.service_items
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
