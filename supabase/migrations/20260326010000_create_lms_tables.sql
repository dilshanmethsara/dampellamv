-- Create assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  grade TEXT NOT NULL,
  subject TEXT NOT NULL,
  teacher_email TEXT NOT NULL,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create announcements table if it doesn't exist (it might exist manually)
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  category TEXT DEFAULT 'announcement',
  image TEXT,
  date DATE DEFAULT CURRENT_DATE,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Simple policies for demo/dev (authenticated/public read, authenticated write)
CREATE POLICY "Allow public read for assignments" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert for assignments" ON public.assignments FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read for announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert for announcements" ON public.announcements FOR INSERT WITH CHECK (true);
