import React from 'react'
import { motion } from 'framer-motion'
import { History, Plus, Minus } from 'lucide-react'
import { itemVariants } from '../../../../utils/motionVariants'
import { timeUntilNextFeeding } from '../../../../utils/starterUtils'
import NextFeedingCard from '../../components/NextFeedingCard'
import type { Starter } from '../../../../types'
import StarterStats from '../../../../containers/StarterStats'

interface StatusCardsProps {
	starter: Starter
	onUpdateFeedingSchedule: (hours: number) => void
}

const StatusCards: React.FC<StatusCardsProps> = ({ starter, onUpdateFeedingSchedule }) => {
	const timeLeft = timeUntilNextFeeding(starter)
	const isOverdue = timeLeft === "Overdue!"

	return (
		<motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-8" variants={itemVariants}>
			{/* Next Feeding Card */}
			<NextFeedingCard 
				timeLeft={timeLeft}
				isOverdue={isOverdue}
				lastFedDate={starter.lastFed}
			/>

			{/* Feeding Schedule Card */}
			<div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
				<div className="flex items-center gap-3 mb-6">
					<History className="text-blue-600" size={24} />
					<h3 className="text-xl font-semibold text-gray-900">Schedule</h3>
				</div>
				<div className="flex items-center justify-between">
					<motion.button
						whileTap={{ scale: 0.95 }}
						className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
						onClick={() => onUpdateFeedingSchedule(Math.max(1, starter.feedingSchedule - 1))}
					>
						<Minus size={20} />
					</motion.button>
					<span className="text-3xl font-bold text-gray-900">{starter.feedingSchedule}h</span>
					<motion.button
						whileTap={{ scale: 0.95 }}
						className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
						onClick={() => onUpdateFeedingSchedule(starter.feedingSchedule + 1)}
					>
						<Plus size={20} />
					</motion.button>
				</div>
			</div>

			{/* Stats Card */}
			<StarterStats starter={starter} />
		</motion.div>
	)
}

export default StatusCards