import React from 'react'
import { motion } from 'framer-motion'
import { itemVariants } from '../../../../utils/motionVariants'
import Button from '../../../../components/ui/Button'

interface FeedingActionsProps {
	onCancel: () => void
	onSave: () => void
}

const FeedingActions: React.FC<FeedingActionsProps> = ({ onCancel, onSave }) => {
	return (
		<motion.div className="flex gap-4" variants={itemVariants}>
			<Button
				variant="secondary"
				size="lg"
				className="flex-1 bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 hover:text-amber-900 focus:ring-amber-500"
				onClick={onCancel}
			>
				Cancel
			</Button>
			<Button
				variant="primary"
				size="lg"
				className="flex-1 bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500 shadow-md hover:shadow-lg"
				onClick={onSave}
			>
				Save Feeding
			</Button>
		</motion.div>
	)
}

export default FeedingActions