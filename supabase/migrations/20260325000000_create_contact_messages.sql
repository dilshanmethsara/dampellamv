-- Create contact_messages table for storing website inquiries
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied'))
);

-- Set up RLS (Row Level Security)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Note: In a production environment, you should be careful with public inserts.
-- For this school project, we allow the public (anon) to submit their inquiries.
CREATE POLICY "Allow public web submissions" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

-- Allow admins (authenticated via dashboard) to read and manage messages
-- Assuming you use the profile roles or service role for dashboard.
CREATE POLICY "Allow authenticated read" ON public.contact_messages
  FOR SELECT USING (auth.role() = 'authenticated');
