/*
  # Create Storage Bucket for Receipts

  1. Storage Setup
    - Create 'receipts' bucket for storing expense receipt images
    - Enable public access for uploaded files
    - Set up RLS policies for secure access

  2. Security
    - Allow authenticated users to upload files
    - Allow public read access to uploaded files
    - Restrict file operations to authenticated users only
*/

-- Create the receipts bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'receipts');

-- Allow authenticated users to view their own files
CREATE POLICY "Authenticated users can view receipts"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'receipts');

-- Allow authenticated users to delete their own files
CREATE POLICY "Authenticated users can delete receipts"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'receipts');

-- Allow public read access to files (for displaying receipts)
CREATE POLICY "Public can view receipts"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'receipts');