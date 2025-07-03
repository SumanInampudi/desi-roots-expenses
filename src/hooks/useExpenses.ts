import { useState, useEffect } from 'react'
import { supabase, type ExpenseWithCategory } from '../lib/supabase'

export const useExpenses = (filters?: { 
  category?: string 
  month?: string 
  year?: string 
}) => {
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('expenses')
        .select(`
          *,
          category:categories(*),
          subcategory:subcategories(*)
        `)
        .order('date', { ascending: false })

      if (filters?.category) {
        query = query.eq('category_id', filters.category)
      }

      if (filters?.month && filters?.year) {
        const startDate = `${filters.year}-${filters.month.padStart(2, '0')}-01`
        const endDate = `${filters.year}-${filters.month.padStart(2, '0')}-31`
        query = query.gte('date', startDate).lte('date', endDate)
      } else if (filters?.year) {
        const startDate = `${filters.year}-01-01`
        const endDate = `${filters.year}-12-31`
        query = query.gte('date', startDate).lte('date', endDate)
      }

      const { data, error } = await query

      if (error) throw error
      setExpenses(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [filters])

  return { expenses, loading, error, refetch: fetchExpenses }
}