-- Create Email settings table
CREATE TABLE IF NOT EXISTS email_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    smtp_host TEXT NOT NULL DEFAULT '',
    smtp_port TEXT NOT NULL DEFAULT '587',
    smtp_username TEXT NOT NULL DEFAULT '',
    smtp_password TEXT NOT NULL DEFAULT '',
    from_email TEXT NOT NULL DEFAULT 'noreply@everspark.com',
    from_name TEXT NOT NULL DEFAULT 'Ever Spark Technologies',
    enable_notifications BOOLEAN NOT NULL DEFAULT true,
    notification_email TEXT NOT NULL DEFAULT 'admin@everspark.com',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default email settings
INSERT INTO email_settings (id, smtp_host, smtp_port, smtp_username, smtp_password, from_email, from_name, enable_notifications, notification_email)
VALUES (
    1,
    '',
    '587',
    '',
    '',
    'noreply@everspark.com',
    'Ever Spark Technologies',
    true,
    'admin@everspark.com'
)
ON CONFLICT (id) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_email_settings_updated_at
    BEFORE UPDATE ON email_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_email_settings_updated_at();
