// components/Collapsible.tsx
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface CollapsibleProps {
    title: React.ReactNode
    icon?: React.ReactNode
    actionButton?: React.ReactNode
    children: React.ReactNode
    defaultOpen?: boolean
    className?: string
}

const Collapsible: React.FC<CollapsibleProps> = ({
    title,
    icon,
    actionButton,
    children,
    defaultOpen = true,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className={className}>
            {/* Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between mb-6 group"
            >
                <div className="flex items-center gap-3">
                    {icon}
                    {typeof title === 'string' ? (
                        <h3 className="text-2xl font-semibold text-amber-900">{title}</h3>
                    ) : (
                        title
                    )}
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Action button */}
                    {actionButton && isOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {actionButton}
                        </motion.div>
                    )}
                    
                    {/* Chevron */}
                    <motion.div
                        animate={{ rotate: isOpen ? 0 : -180 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown 
                            size={24} 
                            className="text-amber-600 group-hover:text-amber-700 transition-colors" 
                        />
                    </motion.div>
                </div>
            </button>

            {/* Content */}
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ 
                            height: "auto", 
                            opacity: 1,
                            transition: {
                                height: { duration: 0.3, ease: "easeInOut" },
                                opacity: { duration: 0.2, delay: 0.1 }
                            }
                        }}
                        exit={{ 
                            height: 0, 
                            opacity: 0,
                            transition: {
                                height: { duration: 0.3, ease: "easeInOut" },
                                opacity: { duration: 0.2 }
                            }
                        }}
                        className="overflow-hidden"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Collapsible