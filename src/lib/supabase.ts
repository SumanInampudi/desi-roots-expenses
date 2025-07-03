import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const hasValidConfig = supabaseUrl && 
  supabaseKey && 
  supabaseUrl !== 'your_supabase_url_here' && 
  supabaseKey !== 'your_supabase_anon_key_here' &&
  isValidUrl(supabaseUrl)

if (!hasValidConfig) {
  console.error('❌ Supabase configuration error:')
  console.log('Please ensure you have a .env file with valid Supabase credentials.')
  console.log('Copy .env.example to .env and replace the placeholder values with your actual Supabase project details.')
  console.log('VITE_SUPABASE_URL:', supabaseUrl || 'Missing')
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing')
  console.log('Get your credentials from: https://supabase.com/dashboard/project/[your-project]/settings/api')
}

// Use fallback values to prevent URL constructor errors
const fallbackUrl = 'https://placeholder.supabase.co'
const fallbackKey = 'placeholder-key'

export const supabase = createClient(
  hasValidConfig ? supabaseUrl : fallbackUrl, 
  hasValidConfig ? supabaseKey : fallbackKey
)

export type Category = {
  id: string
  name: string
  color: string
  icon: string
  created_at: string
}

export type Subcategory = {
  id: string
  name: string
  category_id: string
  icon?: string
  created_at: string
}

export type Expense = {
  id: string
  amount: number
  description: string
  category_id: string
  subcategory_id: string | null
  expense_details: string | null
  receipt_url: string | null
  date: string
  created_at: string
  updated_at: string
  created_by?: string
  created_by_name?: string
}

export type ExpenseWithCategory = Expense & {
  category: Category
  subcategory: Subcategory | null
}

// Helper function to upload receipt image
export const uploadReceipt = async (file: File, expenseId: string): Promise<string | null> => {
  if (!hasValidConfig) {
    console.error('Cannot upload receipt: Supabase not configured')
    return null
  }

  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${expenseId}-${Date.now()}.${fileExt}`
    const filePath = fileName

    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return null
    }

    const { data } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error('Error uploading receipt:', error)
    return null
  }
}

// Helper function to create test user (for development only)
export const createTestUser = async () => {
  if (!hasValidConfig) {
    console.error('Cannot create test user: Supabase not configured')
    return null
  }

  try {
    // Sign up the test user
    const { data, error } = await supabase.auth.signUp({
      email: 'test@gmail.com',
      password: 'password',
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    })

    if (error) {
      console.error('Error creating test user:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating test user:', error)
    return null
  }
}

// Export configuration status for components to check
export const isSupabaseConfigured = hasValidConfig