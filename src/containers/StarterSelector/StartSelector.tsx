import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import type { Starter } from '../../types'

interface StarterSelectorProps {
	starters: Starter[]
	activeStarter: number | null
	onStarterSelect: (id: number) => void
	onAddNewStarter: () => void
	onOpenModal: () => void
}

const StarterSelector: React.FC<StarterSelectorProps> = ({
	starters,
	activeStarter,
	onStarterSelect,
	onAddNewStarter,
	onOpenModal,
}) => {
	return (
		<div className="bg-white border-b border-gray-200">
			<div className="max-w-7xl mx-auto px-6 py-4">
				<div className="flex items-center gap-4 overflow-x-auto">
					<span className="text-sm font-medium text-gray-600 whitespace-nowrap">Active Starter:</span>
					<div className="flex gap-3">
						<AnimatePresence>
							{starters.slice(0, 7).map((starter) => (
								<motion.button
									key={starter.id}
									className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
										activeStarter === starter.id
											? "bg-blue-600 text-white shadow-md"
											: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									}`}
									onClick={() => onStarterSelect(starter.id)}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									layout
								>
									{starter.name}
								</motion.button>
							))}
							{starters.length > 7 && (
								<motion.button
									className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all bg-blue-600 text-white shadow-md"
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									layout
									onClick={onOpenModal}
								>
									Load More
								</motion.button>
							)}
						</AnimatePresence>
						<motion.button
							className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2 whitespace-nowrap"
							onClick={onAddNewStarter}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<Plus size={16} />
							New Starter
						</motion.button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default StarterSelector