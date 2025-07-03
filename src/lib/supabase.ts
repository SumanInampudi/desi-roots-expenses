import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing')
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '')

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