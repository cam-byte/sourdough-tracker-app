import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Droplet, StickyNote } from 'lucide-react'
import { itemVariants } from '../../../../utils/motionVariants'
import type { Feeding, Starter } from '../../../../types'
import FeedingCard from '../../../../components/FeedingCard'
import NoteCard from '../../../../components/NoteCard'

interface RecentActivityProps {
	starter: Starter
	getHydrationPercentage: (feeding: Feeding) => number
	onViewHistory: () => void
	onViewNotes: () => void
	onRecordFeeding: () => void
	onAddNote: () => void
}

const RecentActivity: React.FC<RecentActivityProps> = ({
	starter,
	getHydrationPercentage,
	onViewHistory,
	onViewNotes,
	onRecordFeeding,
	onAddNote,
}) => {
	return (
		<motion.div className="space-y-8" variants={itemVariants}>
			{/* Recent Feedings */}
			<div>
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-2xl font-semibold text-gray-900">Recent Feedings</h3>
					{starter.feedingHistory.length > 3 && (
						<button onClick={onViewHistory} className="text-blue-600 hover:text-blue-700 font-medium">
							View All
						</button>
					)}
				</div>

				{starter.feedingHistory.length === 0 ? (
					<div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
						<Droplet className="text-gray-300 mx-auto mb-4" size={48} />
						<h4 className="text-xl font-semibold text-gray-900 mb-2">No feedings yet</h4>
						<p className="text-gray-600 mb-6">Start tracking your starter's feeding schedule</p>
						<button
							className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
							onClick={onRecordFeeding}
						>
							Record First Feeding
						</button>
					</div>
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<AnimatePresence>
							{starter.feedingHistory.slice(0, 3).map((feeding, index) => (
								<FeedingCard
									key={feeding.id}
									feeding={feeding}
									index={index}
									getHydrationPercentage={getHydrationPercentage}
								/>
							))}
						</AnimatePresence>
					</div>
				)}
			</div>

			{/* Recent Notes */}
			<div>
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-2xl font-semibold text-gray-900">Recent Notes</h3>
					{starter.notes.length > 2 && (
						<button onClick={onViewNotes} className="text-blue-600 hover:text-blue-700 font-medium">
							View All
						</button>
					)}
				</div>

				{starter.notes.length === 0 ? (
					<div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
						<StickyNote className="text-gray-300 mx-auto mb-4" size={48} />
						<h4 className="text-xl font-semibold text-gray-900 mb-2">No notes yet</h4>
						<p className="text-gray-600 mb-6">Keep track of your starter's behavior and observations</p>
						<button
							className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
							onClick={onAddNote}
						>
							Add First Note
						</button>
					</div>
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<AnimatePresence>
							{starter.notes.slice(0, 2).map((note, index) => (
								<NoteCard key={note.id} note={note} index={index} />
							))}
						</AnimatePresence>
					</div>
				)}
			</div>
		</motion.div>
	)
}

export default RecentActivity