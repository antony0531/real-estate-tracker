-- Add project_number column for human-friendly IDs
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_number INTEGER;

-- Create sequence for project numbers (starts at 1)
CREATE SEQUENCE IF NOT EXISTS project_number_seq START 1;

-- Update existing projects with sequential numbers
UPDATE projects 
SET project_number = nextval('project_number_seq') 
WHERE project_number IS NULL;

-- Make project_number NOT NULL after populating existing rows
ALTER TABLE projects ALTER COLUMN project_number SET NOT NULL;

-- Add unique constraint on project_number
ALTER TABLE projects ADD CONSTRAINT unique_project_number UNIQUE (project_number);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_number ON projects(project_number);

-- Add display_id column (BF-YYYY-XXXX format)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS display_id VARCHAR(20);

-- Create index on display_id for searching
CREATE INDEX IF NOT EXISTS idx_display_id ON projects(display_id);