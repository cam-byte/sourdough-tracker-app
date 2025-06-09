import React from 'react'
import { motion } from 'framer-motion'

interface CardProps {
	children: React.ReactNode
	className?: string
	onClick?: () => void
	hoverable?: boolean
	variant?: 'default' | 'outlined' | 'elevated'
}

const Card: React.FC<CardProps> = ({
	children,
	className = '',
	onClick,
	hoverable = false,
	variant = 'default',
}) => {
	const baseStyles = 'rounded-3xl p-8 transition-all'
	
	const variants = {
		default: 'bg-white border border-gray-200 shadow-sm',
		outlined: 'bg-white border-2 border-gray-200',
		elevated: 'bg-white shadow-lg border border-gray-100',
	}
	
	const hoverStyles = hoverable ? 'hover:shadow-md cursor-pointer' : ''
	const clickableStyles = onClick ? 'cursor-pointer' : ''

	const cardClasses = `${baseStyles} ${variants[variant]} ${hoverStyles} ${clickableStyles} ${className}`

	if (onClick || hoverable) {
		return (
			<motion.div
				className={cardClasses}
				onClick={onClick}
				whileHover={hoverable ? { scale: 1.02 } : {}}
				whileTap={onClick ? { scale: 0.98 } : {}}
			>
				{children}
			</motion.div>
		)
	}

	return (
		<div className={cardClasses}>
			{children}
		</div>
	)
}

export default Card