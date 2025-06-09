import React from 'react'
import { motion } from 'framer-motion'

interface ButtonProps {
	children: React.ReactNode
	onClick?: () => void
	disabled?: boolean
	variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
	size?: 'sm' | 'md' | 'lg'
	className?: string
	type?: 'button' | 'submit' | 'reset'
}

const Button: React.FC<ButtonProps> = ({
	children,
	onClick,
	disabled = false,
	variant = 'primary',
	size = 'md',
	className = '',
	type = 'button',
}) => {
	const baseStyles = 'font-medium transition-all duration-200 rounded-xl flex items-center gap-2 justify-center focus:outline-none focus:ring-2 focus:ring-offset-2'
	
	const variants = {
		primary: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500 shadow-md hover:shadow-lg',
		secondary: 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200 focus:ring-amber-500',
		danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-md hover:shadow-lg',
		ghost: 'text-amber-700 hover:text-amber-900 hover:bg-amber-50 focus:ring-amber-500',
	}
	
	const sizes = {
		sm: 'px-3 py-2 text-sm',
		md: 'px-4 py-2',
		lg: 'px-6 py-3 text-lg',
	}
	
	const disabledStyles = disabled 
		? 'bg-amber-200 text-amber-500 cursor-not-allowed hover:bg-amber-200 hover:shadow-none border-amber-200' 
		: variants[variant]

	return (
		<motion.button
			whileHover={disabled ? {} : { scale: 1.02 }}
			whileTap={disabled ? {} : { scale: 0.98 }}
			className={`${baseStyles} ${disabledStyles} ${sizes[size]} ${className}`}
			onClick={onClick}
			disabled={disabled}
			type={type}
		>
			{children}
		</motion.button>
	)
}

export default Button