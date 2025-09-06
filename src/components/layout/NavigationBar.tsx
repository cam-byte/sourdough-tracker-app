// src/components/layout/NavigationBar.tsx
import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Utensils, BookOpen, BarChart3, FileText, Menu, Wheat, X, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const NavigationBar: React.FC = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [showMobileMenu, setShowMobileMenu] = useState(false)
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
    logout()            // clears token + user + localStorage
    navigate('/login')  // send user to login
  }


    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-amber-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <button 
                        className="flex items-center space-x-3 gap-2 hover:bg-amber-50 px-3 py-2 rounded-lg transition-colors"
                        onClick={() => navigate('/dashboard')}
                    >
                        <Wheat className="text-2xl text-amber-600" size={24} />
                        <h1 className="text-xl font-bold text-amber-900">
                            Bread Lab Baker
                        </h1>
                    </button>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-1">
                        {navigationItems.map((item) => {
                            const IconComponent = item.icon
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                                        isActivePath(item.path)
                                            ? 'bg-amber-100 text-amber-900 shadow-sm'
                                            : 'text-amber-700 hover:bg-amber-50 hover:text-amber-900'
                                    }`}
                                >
                                    <IconComponent size={18} />
                                    {item.label}
                                </button>
                            )
                        })}
                        <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 text-amber-700 hover:bg-amber-50 hover:text-amber-900"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </button>
                    </nav>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2 rounded-lg text-amber-700 hover:bg-amber-50"
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                    >
                        {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation Menu */}
                <AnimatePresence>
                    {showMobileMenu && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-amber-200 py-4"
                        >
                            <div className="flex flex-col space-y-2">
                                {navigationItems.map((item) => {
                                    const IconComponent = item.icon
                                    return (
                                        <button
                                            key={item.path}
                                            onClick={() => {
                                                navigate(item.path)
                                                setShowMobileMenu(false)
                                            }}
                                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-3 w-full text-left ${
                                                isActivePath(item.path)
                                                    ? 'bg-amber-100 text-amber-900 shadow-sm'
                                                    : 'text-amber-700 hover:bg-amber-50 hover:text-amber-900'
                                            }`}
                                        >
                                            <IconComponent size={18} />
                                            {item.label}
                                        </button>
                                    )
                                })}
                                
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    )
}

export default NavigationBar