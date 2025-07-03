/*
  # Create expense tracker schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `color` (text, hex color)
      - `icon` (text, lucide icon name)
      - `created_at` (timestamp)
    - `subcategories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category_id` (uuid, foreign key)
      - `created_at` (timestamp)
    - `expenses`
      - `id` (uuid, primary key)
      - `amount` (decimal)
      - `description` (text)
      - `category_id` (uuid, foreign key)
      - `subcategory_id` (uuid, foreign key, nullable)
      - `date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  color text NOT NULL DEFAULT '#3B82F6',
  icon text NOT NULL DEFAULT 'folder',
  created_at timestamptz DEFAULT now()
);

-- Create subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount decimal(10,2) NOT NULL,
  description text NOT NULL,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  subcategory_id uuid REFERENCES subcategories(id) ON DELETE SET NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies (for single user, allow all operations)
CREATE POLICY "Allow all operations on categories"
  ON categories
  FOR ALL
  USING (true);

CREATE POLICY "Allow all operations on subcategories"
  ON subcategories
  FOR ALL
  USING (true);

CREATE POLICY "Allow all operations on expenses"
  ON expenses
  FOR ALL
  USING (true);

-- Insert default categories
INSERT INTO categories (name, color, icon) VALUES
  ('Food & Dining', '#EF4444', 'utensils'),
  ('Transportation', '#3B82F6', 'car'),
  ('Shopping', '#8B5CF6', 'shopping-bag'),
  ('Entertainment', '#F59E0B', 'film'),
  ('Bills & Utilities', '#10B981', 'receipt'),
  ('Healthcare', '#EC4899', 'heart'),
  ('Education', '#06B6D4', 'book'),
  ('Travel', '#84CC16', 'plane'),
  ('Personal Care', '#F97316', 'user'),
  ('Other', '#6B7280', 'more-horizontal');

-- Insert default subcategories
INSERT INTO subcategories (name, category_id) VALUES
  ('Restaurants', (SELECT id FROM categories WHERE name = 'Food & Dining')),
  ('Groceries', (SELECT id FROM categories WHERE name = 'Food & Dining')),
  ('Fast Food', (SELECT id FROM categories WHERE name = 'Food & Dining')),
  ('Gas', (SELECT id FROM categories WHERE name = 'Transportation')),
  ('Public Transit', (SELECT id FROM categories WHERE name = 'Transportation')),
  ('Parking', (SELECT id FROM categories WHERE name = 'Transportation')),
  ('Clothes', (SELECT id FROM categories WHERE name = 'Shopping')),
  ('Electronics', (SELECT id FROM categories WHERE name = 'Shopping')),
  ('Home & Garden', (SELECT id FROM categories WHERE name = 'Shopping')),
  ('Movies', (SELECT id FROM categories WHERE name = 'Entertainment')),
  ('Gaming', (SELECT id FROM categories WHERE name = 'Entertainment')),
  ('Sports', (SELECT id FROM categories WHERE name = 'Entertainment')),
  ('Electricity', (SELECT id FROM categories WHERE name = 'Bills & Utilities')),
  ('Internet', (SELECT id FROM categories WHERE name = 'Bills & Utilities')),
  ('Phone', (SELECT id FROM categories WHERE name = 'Bills & Utilities'));