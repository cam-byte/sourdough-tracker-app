// src/components/layout/AppLayout.tsx
import React from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import NavigationBar from './NavigationBar'
import StarterSelector from './StarterSelector'
import MobileBottomNav from './MobileBottomNav'
import StarterManagementPopup from '../../containers/StarterManagementPopup'
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

    // Check if we should show the starter selector bar
    const shouldShowStarterBar = () => {
        const starterRelatedPaths = ['/dashboard', '/feeding', '/notes', '/history']
        return starterRelatedPaths.some(path =>
            path === '/dashboard'
                ? (location.pathname === '/' || location.pathname === '/dashboard')
                : location.pathname.startsWith(path)
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
            {/* Navigation Header */}
            <NavigationBar />

            {/* Starter Selector Bar */}
            {shouldShowStarterBar() && (
                <StarterSelector
                    starters={starters}
                    activeStarter={activeStarter ?? null}
                    onActiveStarterChange={onActiveStarterChange}
                    onAddNewStarter={onAddNewStarter}
                    onViewAllStarters={onViewAllStarters}
                    onDeleteStarter={onDeleteStarters ? (starterId) => onDeleteStarters([starterId]) : undefined}
                />
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
            <MobileBottomNav />

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