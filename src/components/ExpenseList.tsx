import React, { useState } from 'react'
import { Edit, Trash2, Filter, Search, Calendar, Info, Receipt, Eye, X, User } from 'lucide-react'
import { useExpenses } from '../hooks/useExpenses'
import { useCategories } from '../hooks/useCategories'
import { supabase } from '../lib/supabase'

export const ExpenseList: React.FC = () => {
  const [filters, setFilters] = useState({
    category: '',
    month: '',
    year: new Date().getFullYear().toString(),
    search: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewReceipt, setViewReceipt] = useState<string | null>(null)
  const [viewExpense, setViewExpense] = useState<any>(null)

  const { expenses, loading, refetch } = useExpenses(filters)
  const { categories } = useCategories()

  const filteredExpenses = expenses.filter(expense =>
    expense.description.toLowerCase().includes(filters.search.toLowerCase()) ||
    expense.category?.name.toLowerCase().includes(filters.search.toLowerCase()) ||
    expense.subcategory?.name.toLowerCase().includes(filters.search.toLowerCase()) ||
    expense.expense_details?.toLowerCase().includes(filters.search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

      if (error) throw error
      refetch()
      setDeleteId(null)
    } catch (err) {
      console.error('Error deleting expense:', err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ]

  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString())

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </button>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select
                value={filters.month}
                onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Months</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={filters.year}
                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading expenses...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No expenses found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredExpenses.map(expense => (
                <div key={expense.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-medium"
                          style={{ backgroundColor: expense.category?.color }}
                        >
                          ${Math.round(Number(expense.amount))}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{expense.description}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{expense.category?.name}</span>
                            {expense.subcategory && (
                              <>
                                <span>•</span>
                                <span>{expense.subcategory.name}</span>
                              </>
                            )}
                            {expense.receipt_url && (
                              <>
                                <span>•</span>
                                <div className="flex items-center space-x-1">
                                  <Receipt className="h-3 w-3 text-green-500" />
                                  <span className="text-green-600">Receipt</span>
                                </div>
                              </>
                            )}
                          </div>
                          {expense.expense_details && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Info className="h-3 w-3 text-blue-500" />
                              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                {expense.expense_details}
                              </span>
                            </div>
                          )}
                          {expense.created_by_name && (
                            <div className="flex items-center space-x-1 mt-1">
                              <User className="h-3 w-3 text-purple-500" />
                              <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                Created by: {expense.created_by_name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">${Number(expense.amount).toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{formatDate(expense.date)}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setViewExpense(expense)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {expense.receipt_url && (
                        <button
                          onClick={() => setViewReceipt(expense.receipt_url)}
                          className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                          title="View receipt"
                        >
                          <Receipt className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteId(expense.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Expense Details Modal */}
      {viewExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Expense Details</h3>
              <button
                onClick={() => setViewExpense(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <p className="text-lg font-bold text-gray-900">${Number(viewExpense.amount).toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <p className="text-gray-900">{formatDate(viewExpense.date)}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-900">{viewExpense.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <div className="flex items-center space-x-2">
                    <div
                      className="h-4 w-4 rounded"
                      style={{ backgroundColor: viewExpense.category?.color }}
                    ></div>
                    <span className="text-gray-900">{viewExpense.category?.name}</span>
                  </div>
                </div>
                {viewExpense.subcategory && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                    <p className="text-gray-900">{viewExpense.subcategory.name}</p>
                  </div>
                )}
              </div>
              
              {viewExpense.expense_details && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
                  <p className="text-gray-900">{viewExpense.expense_details}</p>
                </div>
              )}
              
              {viewExpense.created_by_name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                  <p className="text-gray-900">{viewExpense.created_by_name}</p>
                </div>
              )}
              
              {viewExpense.receipt_url && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Receipt</label>
                  <div className="border border-gray-300 rounded-lg p-2">
                    <img
                      src={viewExpense.receipt_url}
                      alt="Receipt"
                      className="w-full h-48 object-cover rounded cursor-pointer"
                      onClick={() => setViewReceipt(viewExpense.receipt_url)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Receipt Viewer Modal */}
      {viewReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-4 max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Receipt</h3>
              <button
                onClick={() => setViewReceipt(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <img
              src={viewReceipt}
              alt="Receipt"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Expense</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this expense? This action cannot be undone.</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}