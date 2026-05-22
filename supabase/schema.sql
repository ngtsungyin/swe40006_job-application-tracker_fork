-- Applications Table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_url TEXT,
  location TEXT,
  status TEXT NOT NULL CHECK (status IN ('wishlist', 'applied', 'interview', 'offer', 'rejected')),
  applied_date DATE,
  deadline DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries by user_id
CREATE INDEX IF NOT EXISTS applications_user_id_idx ON applications(user_id);

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS applications_updated_at_trigger ON applications;
CREATE TRIGGER applications_updated_at_trigger
BEFORE UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION update_applications_updated_at();

-- Enable Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own applications" ON applications;
DROP POLICY IF EXISTS "Users can insert their own applications" ON applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON applications;
DROP POLICY IF EXISTS "Users can delete their own applications" ON applications;

-- RLS Policies
-- Allow users to view only their own applications
CREATE POLICY "Users can view their own applications"
ON applications FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert only their own applications
CREATE POLICY "Users can insert their own applications"
ON applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own applications
CREATE POLICY "Users can update their own applications"
ON applications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete only their own applications
CREATE POLICY "Users can delete their own applications"
ON applications FOR DELETE
USING (auth.uid() = user_id);
