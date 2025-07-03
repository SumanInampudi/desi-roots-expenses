import React, { useState } from 'react'
import { Plus, X, Upload, Image, Trash2 } from 'lucide-react'
import { supabase, uploadReceipt } from '../lib/supabase'
import { useCategories } from '../hooks/useCategories'
import { useAuth } from '../hooks/useAuth'
import { CategoryIcon } from './CategoryIcon'

interface ExpenseFormProps {
  onClose: () => void
  onSuccess: () => void
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onClose, onSuccess }) => {
  const { categories, subcategories } = useCategories()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category_id: '',
    subcategory_id: '',
    expense_details: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingReceipt, setUploadingReceipt] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredSubcategories = subcategories.filter(
    sub => sub.category_id === formData.category_id
  )

  const selectedSubcategory = subcategories.find(sub => sub.id === formData.subcategory_id)
  const showExpenseDetails = selectedSubcategory?.name === 'Others'

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }

      setReceiptFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setReceiptPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const removeReceipt = () => {
    setReceiptFile(null)
    setReceiptPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.description || !formData.category_id) {
      setError('Please fill in all required fields')
      return
    }

    if (!user) {
      setError('User not authenticated')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // First, insert the expense
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .insert([{
          amount: parseFloat(formData.amount),
          description: formData.description,
          category_id: formData.category_id,
          subcategory_id: formData.subcategory_id || null,
          expense_details: formData.expense_details || null,
          date: formData.date,
          receipt_url: null,
          created_by: user.id,
          created_by_name: user.full_name || user.email
        }])
        .select()
        .single()

      if (expenseError) throw expenseError

      // If there's a receipt file, upload it
      let receiptUrl = null
      if (receiptFile && expenseData) {
        setUploadingReceipt(true)
        receiptUrl = await uploadReceipt(receiptFile, expenseData.id)
        
        if (receiptUrl) {
          // Update the expense with the receipt URL
          const { error: updateError } = await supabase
            .from('expenses')
            .update({ receipt_url: receiptUrl })
            .eq('id', expenseData.id)

          if (updateError) {
            console.error('Error updating receipt URL:', updateError)
          }
        }
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense')
    } finally {
      setLoading(false)
      setUploadingReceipt(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset subcategory and expense details when category changes
      ...(name === 'category_id' && { subcategory_id: '', expense_details: '' }),
      // Reset expense details when subcategory changes and it's not "Others"
      ...(name === 'subcategory_id' && subcategories.find(s => s.id === value)?.name !== 'Others' && { expense_details: '' })
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
            Add New Expense
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₹) *
            </label>
            <input
              type="number"
              name="amount"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="What did you spend on?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {filteredSubcategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory
              </label>
              <select
                name="subcategory_id"
                value={formData.subcategory_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select a subcategory</option>
                {filteredSubcategories.map(subcategory => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showExpenseDetails && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expense Details
                <span className="text-gray-500 text-xs ml-1">(Optional)</span>
              </label>
              <textarea
                name="expense_details"
                value={formData.expense_details}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Please specify the expense details..."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Receipt
              <span className="text-gray-500 text-xs ml-1">(Optional)</span>
            </label>
            
            {!receiptPreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptChange}
                  className="hidden"
                  id="receipt-upload"
                />
                <label
                  htmlFor="receipt-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Upload receipt</p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="relative">
                <div className="border border-gray-300 rounded-lg p-2">
                  <img
                    src={receiptPreview}
                    alt="Receipt preview"
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeReceipt}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingReceipt}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-orange-500 text-white rounded-lg hover:from-green-700 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (uploadingReceipt ? 'Uploading...' : 'Adding...') : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}