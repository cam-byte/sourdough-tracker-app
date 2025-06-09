import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, History as HistoryIcon } from 'lucide-react'
import { containerVariants, itemVariants } from '../../utils/motionVariants'
import { getHydrationPercentage } from '../../utils/starterUtils'
import type { Starter, Feeding } from '../../types'
import FeedingHistory from '../../containers/FeedingHistory/FeedingHistory'

interface HistoryProps {
	starter: Starter
	onBack: () => void
	onRecordFeeding: () => void
	onEditFeeding?: (feedingId: number, updatedFeeding: Partial<Feeding>) => void
	onDeleteFeeding?: (feedingId: number) => void
}

const History: React.FC<HistoryProps> = ({ 
	starter, 
	onBack, 
	onRecordFeeding,
	onEditFeeding,
	onDeleteFeeding
}) => {
	return (
		<motion.div
			className="max-w-4xl mx-auto space-y-8 !mt-8"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
		>
			<motion.div className="text-center space-y-4" variants={itemVariants}>
				<button
					onClick={onBack}
					className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-800 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-amber-50"
				>
					<ArrowLeft size={20} />
					Back to Dashboard
				</button>
				<h1 className="text-4xl font-bold text-amber-900">Feeding History</h1>
				<p className="text-amber-700">Complete history of all feedings for {starter.name}</p>
			</motion.div>

			<motion.div className="space-y-6" variants={itemVariants}>
				{starter.feedingHistory.length === 0 ? (
					<div className="bg-white rounded-3xl border-2 border-dashed border-amber-200 p-12 text-center">
						<HistoryIcon className="text-amber-300 mx-auto mb-4" size={48} />
						<h3 className="text-xl font-semibold text-amber-900 mb-2">No feedings recorded</h3>
						<p className="text-amber-700 mb-6">Start tracking your feeding schedule</p>
						<button
							className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
							onClick={onRecordFeeding}
						>
							Record First Feeding
						</button>
					</div>
				) : (
					<FeedingHistory
						starter={starter}
						getHydrationPercentage={getHydrationPercentage}
						showAll={true}
						onEditFeeding={onEditFeeding}
						onDeleteFeeding={onDeleteFeeding}
					/>
				)}
			</motion.div>
		</motion.div>
	)
}

export default History