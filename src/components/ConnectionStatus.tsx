import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Database } from 'lucide-react'
import { supabase } from '../lib/supabase'

export const ConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Test database connection
        const { data, error } = await supabase
          .from('categories')
          .select('count')
          .limit(1)

        if (error) {
          throw error
        }

        setStatus('connected')
        setError(null)
      } catch (err) {
        console.error('Database connection error:', err)
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Connection failed')
      }
    }

    checkConnection()
  }, [])

  if (status === 'checking') {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
        <span>Checking connection...</span>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex items-center space-x-2 text-sm text-red-600">
        <XCircle className="h-4 w-4" />
        <span>Database connection failed</span>
        {error && (
          <span className="text-xs bg-red-100 px-2 py-1 rounded">
            {error}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-green-600">
      <CheckCircle className="h-4 w-4" />
      <span>Connected</span>
    </div>
  )
}