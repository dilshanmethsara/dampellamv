-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
  grade_class TEXT, -- For students
  teacher_id TEXT, -- For teachers
  student_id TEXT, -- For students
  approval_status TEXT DEFAULT 'approved', -- Default to approved for now, can be 'pending'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow everyone to read profiles (for now, simpler for admin panel)
-- In a real app, this should be restricted to authenticated users or admins.
CREATE POLICY "Allow public read access" ON public.profiles
  FOR SELECT USING (true);

-- Policy: Allow manual insert/update for demo purposes (no real Auth integration yet)
CREATE POLICY "Allow all actions for service role" ON public.profiles
  FOR ALL USING (true) WITH CHECK (true);

-- Insert some demo data matching the LMS mock auth
INSERT INTO public.profiles (email, full_name, role, grade_class, approval_status)
VALUES ('student@demo.com', 'Demo Student', 'student', 'Grade 10', 'approved')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.profiles (email, full_name, role, teacher_id, approval_status)
VALUES ('teacher@demo.com', 'Demo Teacher', 'teacher', 'T-1001', 'approved')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.profiles (email, full_name, role, teacher_id, approval_status)
VALUES ('pending@demo.com', 'Pending Teacher', 'teacher', 'T-1002', 'pending')
ON CONFLICT (email) DO NOTHING;
