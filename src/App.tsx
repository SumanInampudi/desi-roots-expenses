import React, { useState } from 'react'
import { 
  BarChart3, 
  Plus, 
  List, 
  Settings, 
  Wallet, 
  TrendingUp,
  Menu,
  X
} from 'lucide-react'
import { Dashboard } from './components/Dashboard'
import { ExpenseForm } from './components/ExpenseForm'
import { ExpenseList } from './components/ExpenseList'
import { Settings as SettingsComponent } from './components/Settings'

type Tab = 'dashboard' | 'expenses' | 'settings'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'expenses', name: 'Expenses', icon: List },
    { id: 'settings', name: 'Settings', icon: Settings }
  ]

  const handleExpenseAdded = () => {
    // Refresh will be handled by the hooks
    setShowExpenseForm(false)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'expenses':
        return <ExpenseList />
      case 'settings':
        return <SettingsComponent />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ExpenseTracker</h1>
                <p className="text-sm text-gray-500">Personal Finance Manager</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="font-medium">{item.name}</span>
                </button>
              ))}
            </nav>

            {/* Add Expense Button */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowExpenseForm(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Add Expense</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as Tab)
                    setShowMobileMenu(false)
                  }}
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {navigation.find(nav => nav.id === activeTab)?.name}
              </h2>
              <p className="text-gray-600 mt-1">
                {activeTab === 'dashboard' && 'Track your spending and view insights'}
                {activeTab === 'expenses' && 'Manage and review your expenses'}
                {activeTab === 'settings' && 'Configure your preferences'}
              </p>
            </div>
            {activeTab === 'dashboard' && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <TrendingUp className="h-4 w-4" />
                <span>Updated in real-time</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="transition-all duration-300">
          {renderContent()}
        </div>
      </main>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <ExpenseForm
          onClose={() => setShowExpenseForm(false)}
          onSuccess={handleExpenseAdded}
        />
      )}

      {/* Background Decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 blur-3xl"></div>
      </div>
    </div>
  )
}

export default App