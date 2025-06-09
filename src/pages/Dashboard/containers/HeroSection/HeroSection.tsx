import React from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Clock } from 'lucide-react'
import { itemVariants } from '../../../../utils/motionVariants'
import { getStarterAge } from '../../../../utils/starterUtils'
import type { Starter } from '../../../../types'

interface HeroSectionProps {
	starter: Starter
	onUpdateStarterName: (name: string) => void
}

const HeroSection: React.FC<HeroSectionProps> = ({ starter, onUpdateStarterName }) => {
	return (
		<motion.div className="text-center space-y-6" variants={itemVariants}>
			<div className="relative inline-block">
				<input
					type="text"
					value={starter.name}
					onChange={(e) => onUpdateStarterName(e.target.value)}
					className="text-5xl font-bold bg-transparent border-none focus:outline-none text-center text-gray-900 hover:bg-gray-50 rounded-lg px-4 py-2 transition-colors"
				/>
			</div>
			<div className="flex items-center justify-center gap-4 text-gray-600">
				<div className="flex items-center gap-2">
					<CalendarDays size={18} />
					<span>Age: {getStarterAge(starter)}</span>
				</div>
				<div className="w-1 h-1 bg-gray-400 rounded-full"></div>
				<div className="flex items-center gap-2">
					<Clock size={18} />
					<span>Every {starter.feedingSchedule}h</span>
				</div>
			</div>
		</motion.div>
	)
}

export default HeroSection