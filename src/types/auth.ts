export interface User {
  id: string
  email: string
  full_name?: string
  is_admin: boolean
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}