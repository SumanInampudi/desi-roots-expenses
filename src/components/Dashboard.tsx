import React from 'react'
import { TrendingUp, TrendingDown, DollarSign, Calendar, PieChart } from 'lucide-react'
import { useExpenses } from '../hooks/useExpenses'
import { useCategories } from '../hooks/useCategories'

export const Dashboard: React.FC = () => {
  const { expenses } = useExpenses()
  const { categories } = useCategories()

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear

  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getMonth() + 1 === currentMonth && expenseDate.getFullYear() === currentYear
  })

  const lastMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getMonth() + 1 === lastMonth && expenseDate.getFullYear() === lastMonthYear
  })

  const currentMonthTotal = currentMonthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
  const lastMonthTotal = lastMonthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)

  const monthlyChange = lastMonthTotal > 0 ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0
  const isIncreasing = monthlyChange > 0

  const categoryTotals = categories.map(category => {
    const categoryExpenses = currentMonthExpenses.filter(expense => expense.category_id === category.id)
    const total = categoryExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
    return { ...category, total }
  }).sort((a, b) => b.total - a.total)

  const stats = [
    {
      name: 'This Month',
      value: `$${currentMonthTotal.toFixed(2)}`,
      change: `${monthlyChange.toFixed(1)}%`,
      changeType: isIncreasing ? 'increase' : 'decrease',
      icon: DollarSign,
    },
    {
      name: 'Last Month',
      value: `$${lastMonthTotal.toFixed(2)}`,
      change: `${currentMonthExpenses.length} expenses`,
      changeType: 'neutral',
      icon: Calendar,
    },
    {
      name: 'Total Expenses',
      value: `$${totalExpenses.toFixed(2)}`,
      change: `${expenses.length} total`,
      changeType: 'neutral',
      icon: PieChart,
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.changeType === 'increase' ? (
                <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
              ) : stat.changeType === 'decrease' ? (
                <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              ) : null}
              <span className={`text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-red-600' : 
                stat.changeType === 'decrease' ? 'text-green-600' : 'text-gray-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-1">
                {stat.changeType !== 'neutral' ? 'vs last month' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories This Month</h3>
        <div className="space-y-3">
          {categoryTotals.filter(cat => cat.total > 0).slice(0, 5).map((category, index) => (
            <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div 
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: category.color }}
                >
                  #{index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{category.name}</p>
                  <p className="text-sm text-gray-500">
                    {currentMonthExpenses.filter(e => e.category_id === category.id).length} expenses
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">${category.total.toFixed(2)}</p>
                <p className="text-sm text-gray-500">
                  {((category.total / currentMonthTotal) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}