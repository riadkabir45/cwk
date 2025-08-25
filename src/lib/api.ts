import { supabase } from './supabase'

// API base URL from environment
const API_BASE_URL = import.meta.env.VITE_SERVER_URI || 'http://localhost:8080'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  headers?: Record<string, string>
}

/**
 * Make authenticated API calls to your Spring Boot backend
 * Automatically includes the Supabase JWT token in the Authorization header
 */
export const apiCall = async (endpoint: string, options: ApiOptions = {}) => {
  const { method = 'GET', body, headers = {} } = options

  // Get the current session and JWT token
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  // Set content type for JSON requests
  if (body && typeof body === 'object') {
    headers['Content-Type'] = 'application/json'
  }

  const config: RequestInit = {
    method,
    headers,
  }

  if (body) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body)
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    
    // Handle different response types
    const contentType = response.headers.get('content-type')
    let data
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`)
    }

    return { data, status: response.status }
  } catch (error) {
    console.error('API call failed:', error)
    throw error
  }
}

// Convenience methods
export const api = {
  get: (endpoint: string, headers?: Record<string, string>) => 
    apiCall(endpoint, { method: 'GET', headers }),
    
  post: (endpoint: string, body?: any, headers?: Record<string, string>) => 
    apiCall(endpoint, { method: 'POST', body, headers }),
    
  put: (endpoint: string, body?: any, headers?: Record<string, string>) => 
    apiCall(endpoint, { method: 'PUT', body, headers }),
    
  delete: (endpoint: string, headers?: Record<string, string>) => 
    apiCall(endpoint, { method: 'DELETE', headers }),
    
  patch: (endpoint: string, body?: any, headers?: Record<string, string>) => 
    apiCall(endpoint, { method: 'PATCH', body, headers }),
}
