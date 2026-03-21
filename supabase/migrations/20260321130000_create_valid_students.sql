-- Create valid_students table
CREATE TABLE IF NOT EXISTS public.valid_students (
  student_id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  grade TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up RLS
ALTER TABLE public.valid_students ENABLE ROW LEVEL SECURITY;

-- Policy: Allow everyone to read (needed for validation during public signup)
CREATE POLICY "Allow public read access" ON public.valid_students
  FOR SELECT USING (true);

-- Policy: Allow all actions for admin/service role
CREATE POLICY "Allow all actions" ON public.valid_students
  FOR ALL USING (true) WITH CHECK (true);

-- Insert some demo valid IDs
INSERT INTO public.valid_students (student_id, full_name, grade)
VALUES 
  ('STU-2024-001', 'Alice Johnson', 'Grade 10'),
  ('STU-2024-002', 'Bob Smith', 'Grade 11'),
  ('STU-2024-003', 'Charlie Brown', 'Grade 9')
ON CONFLICT (student_id) DO NOTHING;
