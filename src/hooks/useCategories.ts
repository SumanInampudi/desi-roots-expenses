import { useState, useEffect } from 'react'
import { supabase, type Category, type Subcategory } from '../lib/supabase'

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchSubcategories = async () => {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .order('name')

      if (error) throw error
      setSubcategories(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchSubcategories()
  }, [])

  return { 
    categories, 
    subcategories, 
    loading, 
    error, 
    refetch: () => {
      fetchCategories()
      fetchSubcategories()
    }
  }
}