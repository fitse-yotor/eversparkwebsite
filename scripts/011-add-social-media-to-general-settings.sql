ALTER TABLE public.general_settings
ADD COLUMN social_media_links JSONB DEFAULT '{
    "facebook": "https://facebook.com/everspark",
    "twitter": "https://twitter.com/everspark",
    "linkedin": "https://linkedin.com/company/everspark"
}';

-- Update existing row with default social media links if they are null
UPDATE public.general_settings
SET social_media_links = '{
    "facebook": "https://facebook.com/everspark",
    "twitter": "https://twitter.com/everspark",
    "linkedin": "https://linkedin.com/company/everspark"
}'
WHERE id = 1 AND social_media_links IS NULL;
