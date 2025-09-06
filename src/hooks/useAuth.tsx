// src/hooks/useAuth.ts
import { useState, useEffect, createContext, useContext } from 'react'

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
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        console.log('token exists in useAuthProvider:', token !== null)
        console.log('token length:', token ? token.length : 'no token')
    }, [token])

    // Initialize auth state from localStorage
    useEffect(() => {
        const savedToken = localStorage.getItem('auth_token')
        const savedUser = localStorage.getItem('auth_user')
        
        if (savedToken && savedUser) {
            setToken(savedToken)
            setUser(JSON.parse(savedUser))
        }
    }, [])

    const clearError = () => setError(null)

    const login = async (email: string, password: string) => {
        setLoading(true)
        setError(null)
        
        try {
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
            setToken(data.token)
            setUser(data.user)
            
            // Save to localStorage
            localStorage.setItem('auth_token', data.token)
            localStorage.setItem('auth_user', JSON.stringify(data.user))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed')
            throw err
        } finally {
            setLoading(false)
        }
    }

    const register = async (email: string, password: string, name: string) => {
        setLoading(true)
        setError(null)
        
        try {
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
            setToken(data.token)
            setUser(data.user)
            
            // Save to localStorage
            localStorage.setItem('auth_token', data.token)
            localStorage.setItem('auth_user', JSON.stringify(data.user))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed')
            throw err
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
    }

    return {
        user,
        token,
        login,
        register,
        logout,
        loading,
        error,
        clearError,
    }
}

export { AuthContext }