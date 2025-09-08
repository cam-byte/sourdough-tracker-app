// src/hooks/useAuth.ts
import { useState, useEffect, createContext, useContext } from 'react'
import apiService from '../services/api'

interface User {
    id: number
    email: string
    name: string
    created_at: string
    updated_at: string
}

interface AuthContextType {
    user: User | null
    token: string | null
    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string, name: string) => Promise<void>
    logout: () => void
    loading: boolean
    error: string | null
    clearError: () => void
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const useAuthProvider = () => {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true) // Start with true for initial load
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        console.log('Auth state changed - token exists:', token !== null)
        console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'no token')
    }, [token])

    // Initialize auth state from localStorage
    useEffect(() => {
        const initializeAuth = () => {
            try {
                const savedToken = localStorage.getItem('auth_token')
                const savedUser = localStorage.getItem('auth_user')
                
                console.log('Initializing auth from localStorage:', { 
                    hasToken: !!savedToken, 
                    hasUser: !!savedUser 
                })
                
                if (savedToken && savedUser) {
                    const parsedUser = JSON.parse(savedUser)
                    setToken(savedToken)
                    setUser(parsedUser)
                    // IMPORTANT: Sync token with API service
                    apiService.setToken(savedToken)
                    console.log('Auth restored from localStorage')
                } else {
                    // Ensure API service has no token
                    apiService.setToken(null)
                }
            } catch (err) {
                console.error('Failed to restore auth from localStorage:', err)
                // Clear corrupted data
                localStorage.removeItem('auth_token')
                localStorage.removeItem('auth_user')
                apiService.setToken(null)
            } finally {
                setLoading(false)
            }
        }

        initializeAuth()
    }, [])

    const clearError = () => setError(null)

    const login = async (email: string, password: string) => {
        setLoading(true)
        setError(null)
        
        try {
            console.log('Attempting login for:', email)
            
            const response = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Login failed')
            }

            const data = await response.json()
            console.log('Login successful, received token:', !!data.token)
            
            // Update state
            setToken(data.token)
            setUser(data.user)
            
            // Save to localStorage
            localStorage.setItem('auth_token', data.token)
            localStorage.setItem('auth_user', JSON.stringify(data.user))
            
            // IMPORTANT: Sync token with API service immediately
            apiService.setToken(data.token)
            
            console.log('Token synced with API service')
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed'
            setError(errorMessage)
            console.error('Login error:', errorMessage)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const register = async (email: string, password: string, name: string) => {
        setLoading(true)
        setError(null)
        
        try {
            console.log('Attempting registration for:', email)
            
            const response = await fetch('http://localhost:8080/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, name }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Registration failed')
            }

            const data = await response.json()
            console.log('Registration successful, received token:', !!data.token)
            
            // Update state
            setToken(data.token)
            setUser(data.user)
            
            // Save to localStorage
            localStorage.setItem('auth_token', data.token)
            localStorage.setItem('auth_user', JSON.stringify(data.user))
            
            // IMPORTANT: Sync token with API service immediately
            apiService.setToken(data.token)
            
            console.log('Token synced with API service')
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Registration failed'
            setError(errorMessage)
            console.error('Registration error:', errorMessage)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        console.log('Logging out user')
        
        // Clear state
        setUser(null)
        setToken(null)
        
        // Clear localStorage
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        
        // IMPORTANT: Clear token from API service
        apiService.setToken(null)
        
        console.log('Logout complete, all tokens cleared')
    }

    const isAuthenticated = !!(token && user)

    return {
        user,
        token,
        login,
        register,
        logout,
        loading,
        error,
        clearError,
        isAuthenticated,
    }
}

export { AuthContext }