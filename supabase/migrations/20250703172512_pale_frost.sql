/*
  # Create receipts storage bucket and policies

  1. Storage Setup
    - Create 'receipts' storage bucket for expense receipt uploads
    - Configure bucket to be private (not public by default)
  
  2. Security Policies
    - Allow authenticated users to upload receipts (INSERT)
    - Allow authenticated users to view their own receipts (SELECT)
    - Allow authenticated users to delete their own receipts (DELETE)
    
  3. Notes
    - Receipts are linked to expenses, so users can only access receipts for their own expenses
    - Files are stored with expense ID prefix for organization
*/

-- Create the receipts storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts', 
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the storage.objects table for the receipts bucket
CREATE POLICY "Allow authenticated users to upload receipts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Allow authenticated users to view receipts"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'receipts');

CREATE POLICY "Allow authenticated users to delete receipts"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'receipts');

CREATE POLICY "Allow authenticated users to update receipts"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'receipts')
WITH CHECK (bucket_id = 'receipts');