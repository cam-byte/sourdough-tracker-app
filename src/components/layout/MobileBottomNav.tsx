// src/components/layout/MobileBottomNav.tsx
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Utensils, BookOpen, BarChart3, FileText, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const MobileBottomNav: React.FC = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { logout } = useAuth()


    const navigationItems = [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/feeding', label: 'Feed', icon: Utensils },
        { path: '/recipes', label: 'Recipes', icon: BookOpen },
        { path: '/history', label: 'History', icon: BarChart3 },
        { path: '/notes', label: 'Notes', icon: FileText },
    ]

    const isActivePath = (path: string) => {
        if (path === '/dashboard') {
            return location.pathname === '/' || location.pathname === '/dashboard'
        }
        return location.pathname.startsWith(path)
    }

    const handleLogout = () => {
        // Clear any authentication tokens or user data here
        // For example, if using localStorage:
        logout()  // Clear auth state using the useAuth hook
        // Redirect to login page
        navigate('/login')
    }

    return (
        <nav className="md:hidden bg-white border-t border-amber-200 px-4 py-2">
            <div className="flex justify-around">
                {navigationItems.map((item) => {
                    const IconComponent = item.icon
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors duration-200 ${
                                isActivePath(item.path)
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'text-amber-600 hover:text-amber-900'
                            }`}
                        >
                            <IconComponent size={20} className="mb-1" />
                            <span className="text-xs font-medium">{item.label}</span>
                        </button>
                    )
                })}
                {/* Mobile logout button */}
                <button
                    onClick={() => {
                        handleLogout()
                    }}
                    type="button"
                    className="px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-3 w-full text-left text-amber-700 hover:bg-amber-50 hover:text-amber-900"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </nav>
    )
}

export default MobileBottomNav