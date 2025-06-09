import React from 'react'
import { AnimatePresence } from 'framer-motion'
import type { Starter, Feeding } from '../../types'
import FeedingCard from '../../components/FeedingCard'

interface FeedingHistoryProps {
	starter: Starter
	getHydrationPercentage: (feeding: Feeding) => number
	showAll?: boolean
	onEditFeeding?: (feedingId: number, updatedFeeding: Partial<Feeding>) => void
	onDeleteFeeding?: (feedingId: number) => void
}

const FeedingHistory: React.FC<FeedingHistoryProps> = ({ 
	starter, 
	getHydrationPercentage, 
	showAll = false,
	onEditFeeding,
	onDeleteFeeding
}) => {
	const feedingsToShow = showAll ? starter.feedingHistory : starter.feedingHistory.slice(0, 3)

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
			<AnimatePresence>
				{feedingsToShow.map((feeding, index) => (
					<FeedingCard
						key={feeding.id}
						feeding={feeding}
						index={index}
						getHydrationPercentage={getHydrationPercentage}
						onEdit={onEditFeeding}
						onDelete={onDeleteFeeding}
					/>
				))}
			</AnimatePresence>
		</div>
	)
}

export default FeedingHistory