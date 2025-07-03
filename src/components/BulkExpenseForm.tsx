import React, { useState } from 'react'
import { Plus, X, Trash2, Upload, Save, Image } from 'lucide-react'
import { supabase, uploadReceipt } from '../lib/supabase'
import { useCategories } from '../hooks/useCategories'
import { useAuth } from '../hooks/useAuth'

interface ExpenseItem {
  id: string
  amount: string
  description: string
  category_id: string
  subcategory_id: string
  expense_details: string
  date: string
  receiptFile: File | null
  receiptPreview: string | null
}

interface BulkExpenseFormProps {
  onClose: () => void
  onSuccess: () => void
}

export const BulkExpenseForm: React.FC<BulkExpenseFormProps> = ({ onClose, onSuccess }) => {
  const { categories, subcategories } = useCategories()
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    {
      id: '1',
      amount: '',
      description: '',
      category_id: '',
      subcategory_id: '',
      expense_details: '',
      date: new Date().toISOString().split('T')[0],
      receiptFile: null,
      receiptPreview: null
    }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addExpense = () => {
    const newExpense: ExpenseItem = {
      id: Date.now().toString(),
      amount: '',
      description: '',
      category_id: '',
      subcategory_id: '',
      expense_details: '',
      date: new Date().toISOString().split('T')[0],
      receiptFile: null,
      receiptPreview: null
    }
    setExpenses([...expenses, newExpense])
  }

  const removeExpense = (id: string) => {
    if (expenses.length > 1) {
      setExpenses(expenses.filter(expense => expense.id !== id))
    }
  }

  const updateExpense = (id: string, field: keyof ExpenseItem, value: any) => {
    setExpenses(expenses.map(expense => {
      if (expense.id === id) {
        const updated = { ...expense, [field]: value }
        // Reset subcategory and expense details when category changes
        if (field === 'category_id') {
          updated.subcategory_id = ''
          updated.expense_details = ''
        }
        // Reset expense details when subcategory changes and it's not "Others"
        if (field === 'subcategory_id') {
          const subcategory = subcategories.find(s => s.id === value)
          if (subcategory?.name !== 'Others') {
            updated.expense_details = ''
          }
        }
        return updated
      }
      return expense
    }))
  }

  const handleReceiptChange = (id: string, file: File | null) => {
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

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        updateExpense(id, 'receiptPreview', e.target?.result as string)
      }
      reader.readAsDataURL(file)
      updateExpense(id, 'receiptFile', file)
      setError(null)
    } else {
      updateExpense(id, 'receiptFile', null)
      updateExpense(id, 'receiptPreview', null)
    }
  }

  const validateExpenses = () => {
    for (const expense of expenses) {
      if (!expense.amount || !expense.description || !expense.category_id) {
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateExpenses()) {
      setError('Please fill in all required fields for each expense')
      return
    }

    if (!user) {
      setError('User not authenticated')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Process each expense
      for (const expense of expenses) {
        // Insert expense
        const { data: expenseData, error: expenseError } = await supabase
          .from('expenses')
          .insert([{
            amount: parseFloat(expense.amount),
            description: expense.description,
            category_id: expense.category_id,
            subcategory_id: expense.subcategory_id || null,
            expense_details: expense.expense_details || null,
            date: expense.date,
            receipt_url: null,
            created_by: user.id,
            created_by_name: user.full_name || user.email
          }])
          .select()
          .single()

        if (expenseError) throw expenseError

        // Upload receipt if exists
        if (expense.receiptFile && expenseData) {
          const receiptUrl = await uploadReceipt(expense.receiptFile, expenseData.id)
          
          if (receiptUrl) {
            const { error: updateError } = await supabase
              .from('expenses')
              .update({ receipt_url: receiptUrl })
              .eq('id', expenseData.id)

            if (updateError) {
              console.error('Error updating receipt URL:', updateError)
            }
          }
        }
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expenses')
    } finally {
      setLoading(false)
    }
  }

  const getFilteredSubcategories = (categoryId: string) => {
    return subcategories.filter(sub => sub.category_id === categoryId)
  }

  const shouldShowExpenseDetails = (expense: ExpenseItem) => {
    const selectedSubcategory = subcategories.find(sub => sub.id === expense.subcategory_id)
    return selectedSubcategory?.name === 'Others'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add Multiple Expenses</h2>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Row */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-12 gap-3 text-sm font-medium text-gray-700">
              <div className="col-span-1">#</div>
              <div className="col-span-1">Amount *</div>
              <div className="col-span-2">Description *</div>
              <div className="col-span-2">Category *</div>
              <div className="col-span-2">Subcategory</div>
              <div className="col-span-1">Date *</div>
              <div className="col-span-2">Receipt</div>
              <div className="col-span-1">Actions</div>
            </div>
          </div>

          {/* Expense Rows */}
          <div className="space-y-3">
            {expenses.map((expense, index) => (
              <div key={expense.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-12 gap-3 items-start">
                  {/* Row Number */}
                  <div className="col-span-1 flex items-center">
                    <span className="text-sm font-medium text-gray-600 bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center">
                      {index + 1}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="col-span-1">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={expense.amount}
                      onChange={(e) => updateExpense(expense.id, 'amount', e.target.value)}
                      className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="col-span-2">
                    <textarea
                      value={expense.description}
                      onChange={(e) => updateExpense(expense.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Expense description..."
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="col-span-2">
                    <select
                      value={expense.category_id}
                      onChange={(e) => updateExpense(expense.id, 'category_id', e.target.value)}
                      className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory */}
                  <div className="col-span-2">
                    <select
                      value={expense.subcategory_id}
                      onChange={(e) => updateExpense(expense.id, 'subcategory_id', e.target.value)}
                      className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={!expense.category_id}
                    >
                      <option value="">Select subcategory</option>
                      {getFilteredSubcategories(expense.category_id).map(subcategory => (
                        <option key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </option>
                      ))}
                    </select>
                    
                    {/* Expense Details for "Others" */}
                    {shouldShowExpenseDetails(expense) && (
                      <textarea
                        value={expense.expense_details}
                        onChange={(e) => updateExpense(expense.id, 'expense_details', e.target.value)}
                        rows={1}
                        className="w-full px-2 py-1 mt-2 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Specify details..."
                      />
                    )}
                  </div>

                  {/* Date */}
                  <div className="col-span-1">
                    <input
                      type="date"
                      value={expense.date}
                      onChange={(e) => updateExpense(expense.id, 'date', e.target.value)}
                      className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Receipt Upload */}
                  <div className="col-span-2">
                    {!expense.receiptPreview ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleReceiptChange(expense.id, e.target.files?.[0] || null)}
                          className="hidden"
                          id={`receipt-upload-${expense.id}`}
                        />
                        <label
                          htmlFor={`receipt-upload-${expense.id}`}
                          className="flex items-center space-x-1 px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded cursor-pointer transition-colors"
                        >
                          <Upload className="h-3 w-3" />
                          <span>Upload</span>
                        </label>
                        <span className="text-xs text-gray-500">Optional</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <img
                            src={expense.receiptPreview}
                            alt="Receipt"
                            className="w-12 h-12 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => handleReceiptChange(expense.id, null)}
                            className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="h-2 w-2" />
                          </button>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-green-600">
                          <Image className="h-3 w-3" />
                          <span>Uploaded</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-center">
                    {expenses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExpense(expense.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Remove expense"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Row Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={addExpense}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors border border-blue-200"
            >
              <Plus className="h-4 w-4" />
              <span>Add Another Row</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {expenses.length} expense{expenses.length !== 1 ? 's' : ''} ready to save
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !validateExpenses()}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save All Expenses</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}