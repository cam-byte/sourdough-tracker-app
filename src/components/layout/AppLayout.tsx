import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Utensils, BookOpen, BarChart3, FileText, Menu, Wheat, Plus, X, Star } from 'lucide-react'
import StarterManagementPopup from '../../containers/StarterManagementPopup'

// Import the correct types from your types file
import type { Starter } from '../../types'

interface AppLayoutProps {
    children: React.ReactNode
    // Starter management props
    starters?: Starter[]
    activeStarter?: number | null
    onActiveStarterChange?: (starterId: number) => void
    onAddNewStarter?: () => void
    onViewAllStarters?: () => void
    onDeleteStarters?: (starterIds: number[]) => void
    onToggleFavorite?: (starterId: number) => void
    onEditStarter?: (starterId: number) => void
    onDuplicateStarter?: (starterId: number) => void
    onViewRecipe?: (recipeId: number) => void
    // New props for popup management
    showStarterManagement?: boolean
    onCloseStarterManagement?: () => void
}

const AppLayout: React.FC<AppLayoutProps> = ({
    children,
    starters = [],
    activeStarter,
    onActiveStarterChange,
    onAddNewStarter,
    onViewAllStarters,
    onDeleteStarters,
    onToggleFavorite,
    onEditStarter,
    onDuplicateStarter,
    onViewRecipe,
    showStarterManagement = false,
    onCloseStarterManagement
}) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [showMobileMenu, setShowMobileMenu] = useState(false)

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

    // Check if we should show the starter selector bar
    const shouldShowStarterBar = () => {
        const starterRelatedPaths = ['/dashboard', '/feeding', '/notes', '/history']
        return starterRelatedPaths.some(path =>
            path === '/dashboard'
                ? (location.pathname === '/' || location.pathname === '/dashboard')
                : location.pathname.startsWith(path)
        )
    }

    const isOverdue = (starter: Starter): boolean => {
        if (!starter.lastFed || !starter.feedingSchedule) return false

        const lastFed = new Date(starter.lastFed)
        const nextFeeding = new Date(lastFed.getTime() + starter.feedingSchedule * 60 * 60 * 1000)
        return new Date() > nextFeeding
    }

    const getSortedStartersForTopBar = () => {
        return [...starters].sort((a, b) => {
            // First, sort by favorite status (favorites first)
            const aFavorite = a.isFavorite || false
            const bFavorite = b.isFavorite || false

            if (aFavorite && !bFavorite) return -1
            if (!aFavorite && bFavorite) return 1

            // If both are favorites or both are not favorites, sort by name
            return a.name.localeCompare(b.name)
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-amber-200">
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
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${isActivePath(item.path)
                                            ? 'bg-amber-100 text-amber-900 shadow-sm'
                                            : 'text-amber-700 hover:bg-amber-50 hover:text-amber-900'
                                            }`}
                                    >
                                        <IconComponent size={18} />
                                        {item.label}
                                    </button>
                                )
                            })}
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
                                                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-3 w-full text-left ${isActivePath(item.path)
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

            {/* Starter Selector Bar */}
            {shouldShowStarterBar() && starters.length > 0 && (
                <div className="bg-white border-b border-amber-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <span className="text-sm font-medium text-amber-700 whitespace-nowrap">
                                Active Starter:
                            </span>

                            {/* Horizontal scrolling container */}
                            <div className="flex-1 overflow-x-auto scrollbar-hide">
                                <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
                                    <AnimatePresence>
                                        {/* Show first 7 starters on desktop, all on mobile with scroll */}
                                        {getSortedStartersForTopBar().slice(0, window.innerWidth >= 640 ? 7 : starters.length).map((starter) => {
                                            const starterOverdue = isOverdue(starter)
                                            const isFavorite = starter.isFavorite || false

                                            return (
                                                <motion.button
                                                    key={starter.id}
                                                    className={`relative px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 flex-shrink-0 ${activeStarter === starter.id
                                                            ? 'bg-amber-500 text-white shadow-md'
                                                            : isFavorite
                                                                ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 hover:from-yellow-200 hover:to-amber-200 border border-yellow-300'
                                                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                                        }`}
                                                    onClick={() => onActiveStarterChange?.(starter.id)}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    layout
                                                >
                                                    {/* Add star icon for favorites */}
                                                    {isFavorite && (
                                                        <Star size={14} className={`${activeStarter === starter.id ? 'text-white' : 'text-yellow-500'} fill-current`} />
                                                    )}
                                                    {starter.name}
                                                    {starterOverdue && (
                                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                                    )}
                                                </motion.button>
                                            )
                                        })}

                                        {/* View More button if more than 7 starters and on desktop */}
                                        {starters.length > 7 && window.innerWidth >= 640 && (
                                            <motion.button
                                                className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap bg-amber-600 text-white hover:bg-amber-700 transition-colors flex-shrink-0"
                                                onClick={onViewAllStarters}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                layout
                                            >
                                                View More ({starters.length - 7})
                                            </motion.button>
                                        )}

                                        {/* Add New Starter button */}
                                        <motion.button
                                            className="px-4 py-2 rounded-xl text-sm font-medium bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                                            onClick={onAddNewStarter}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Plus size={16} />
                                            New Starter
                                        </motion.button>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden bg-white border-t border-amber-200 px-4 py-2">
                <div className="flex justify-around">
                    {navigationItems.map((item) => {
                        const IconComponent = item.icon
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors duration-200 ${isActivePath(item.path)
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'text-amber-600 hover:text-amber-900'
                                    }`}
                            >
                                <IconComponent size={20} className="mb-1" />
                                <span className="text-xs font-medium">{item.label}</span>
                            </button>
                        )
                    })}
                </div>
            </nav>

            {/* Starter Management Popup */}
            <StarterManagementPopup
                isOpen={showStarterManagement}
                onClose={onCloseStarterManagement || (() => { })}
                starters={starters}
                activeStarter={activeStarter}
                onActiveStarterChange={onActiveStarterChange}
                onDeleteStarters={onDeleteStarters}
                onToggleFavorite={onToggleFavorite}
                onEditStarter={onEditStarter}
                onDuplicateStarter={onDuplicateStarter}
                onViewRecipe={onViewRecipe}
            />
        </div>
    )
}

export default AppLayout