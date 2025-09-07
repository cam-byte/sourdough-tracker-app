// src/components/layout/StarterSelector.tsx
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Star, X } from 'lucide-react'
import type { Starter } from '../../types'

interface StarterSelectorProps {
    starters: Starter[]
    activeStarter: number | null | undefined  // Add undefined here
    onActiveStarterChange?: (starterId: number) => void
    onAddNewStarter?: () => void
    onViewAllStarters?: () => void
    onDeleteStarter?: (starterId: number) => void
}

const StarterSelector: React.FC<StarterSelectorProps> = ({
    starters,
    activeStarter,
    onActiveStarterChange,
    onAddNewStarter,
    onViewAllStarters,
    onDeleteStarter
}) => {
    const isOverdue = (starter: Starter): boolean => {
        if (!starter.lastFed || !starter.feedingSchedule) return false

        const lastFed = new Date(starter.lastFed)
        const nextFeeding = new Date(lastFed.getTime() + starter.feedingSchedule * 60 * 60 * 1000)
        return new Date() > nextFeeding
    }

    const getSortedStarters = () => {
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

    if (starters.length === 0) return null

    return (
        <div className="sticky top-16 z-40 bg-white border-b border-amber-200 shadow-sm">
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
                                {getSortedStarters().slice(0, window.innerWidth >= 640 ? 7 : starters.length).map((starter) => {
                                    const starterOverdue = isOverdue(starter)
                                    const isFavorite = starter.isFavorite || false

                                    return (
                                        <motion.button
                                            key={starter.id}
                                            className={`group relative px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex items-center gap-2 flex-shrink-0 overflow-hidden ${activeStarter === starter.id
                                                    ? 'bg-amber-500 text-white shadow-md'
                                                    : isFavorite
                                                        ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 hover:from-yellow-200 hover:to-amber-200 border border-yellow-300'
                                                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                                }`}
                                            onClick={() => onActiveStarterChange?.(starter.id)}
                                            whileHover={{
                                                scale: 1.05,
                                                paddingRight: '2rem', // Grow the button width
                                                transition: { duration: 0.3, ease: 'easeOut' }
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                            layout
                                        >
                                            {/* Star icon for favorites */}
                                            {isFavorite && (
                                                <Star
                                                    size={14}
                                                    className={`${activeStarter === starter.id ? 'text-white' : 'text-yellow-500'} fill-current`}
                                                />
                                            )}
                                            {starter.name}
                                            {starterOverdue && (
                                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                            )}

                                            {/* X button - fades in as button grows */}
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                                <div
                                                    className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onDeleteStarter?.(starter.id)
                                                    }}
                                                >
                                                    <X className="text-white transition-colors" size={12} />
                                                </div>
                                            </div>
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
    )
}

export default StarterSelector