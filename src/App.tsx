import React, { useState } from 'react'
import { 
  BarChart3, 
  Plus, 
  List, 
  Settings, 
  Wallet, 
  TrendingUp,
  Menu,
  X,
  LogOut,
  Users,
  PlusSquare,
  XCircle
} from 'lucide-react'
import { Dashboard } from './components/Dashboard'
import { ExpenseForm } from './components/ExpenseForm'
import { BulkExpenseForm } from './components/BulkExpenseForm'
import { ExpenseList } from './components/ExpenseList'
import { Settings as SettingsComponent } from './components/Settings'
import { LoginPage } from './components/LoginPage'
import { ConnectionStatus } from './components/ConnectionStatus'
import { useAuth } from './hooks/useAuth'

type Tab = 'dashboard' | 'expenses' | 'settings'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showBulkExpenseForm, setShowBulkExpenseForm] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [dashboardKey, setDashboardKey] = useState(0)

  const { user, loading, error, signOut } = useAuth()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show error if there's an authentication error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="text-red-500 mb-4">
            <XCircle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Show login page if user is not authenticated
  if (!user) {
    return <LoginPage />
  }

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'expenses', name: 'Expenses', icon: List },
    { id: 'settings', name: 'Settings', icon: Settings }
  ]

  const handleExpenseAdded = () => {
    // Refresh dashboard by changing key
    setDashboardKey(prev => prev + 1)
    setShowExpenseForm(false)
    setShowBulkExpenseForm(false)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard key={dashboardKey} />
      case 'expenses':
        return <ExpenseList />
      case 'settings':
        return <SettingsComponent />
      default:
        return <Dashboard key={dashboardKey} />
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

            {/* User Info & Actions */}
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <ConnectionStatus />

              {/* User Info */}
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{user.full_name || user.email}</span>
                {user.is_admin && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    Admin
                  </span>
                )}
              </div>

              {/* Add Expense Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowExpenseForm(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Add Expense</span>
                </button>
                
                <button
                  onClick={() => setShowBulkExpenseForm(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-teal-600 text-white px-3 py-2 rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <PlusSquare className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Bulk Add</span>
                </button>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
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
              {/* User Info Mobile */}
              <div className="flex items-center space-x-2 px-4 py-3 text-sm text-gray-600 border-b border-gray-200">
                <Users className="h-4 w-4" />
                <span>{user.full_name || user.email}</span>
                {user.is_admin && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    Admin
                  </span>
                )}
              </div>
              
              {/* Navigation Items */}
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

      {/* Bulk Expense Form Modal */}
      {showBulkExpenseForm && (
        <BulkExpenseForm
          onClose={() => setShowBulkExpenseForm(false)}
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