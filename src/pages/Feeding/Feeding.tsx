import React from 'react'
import { motion } from 'framer-motion'
import { containerVariants } from '../../utils/motionVariants'
import FeedingHeader from './containers/FeedingHeader'
import FeedingForm from './containers/FeedingForm'
import FeedingActions from './containers/FeedingActions'
import type { NewFeeding } from '../../types'

interface FeedingProps {
	newFeeding: NewFeeding
	onUpdateFeeding: (feeding: NewFeeding) => void
	onSaveFeeding: () => void
	onCancel: () => void
}

const Feeding: React.FC<FeedingProps> = ({
	newFeeding,
	onUpdateFeeding,
	onSaveFeeding,
	onCancel,
}) => {
	return (
		<motion.div
			className="max-w-2xl mx-auto space-y-8 !mt-8 !p-4"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
		>
			<FeedingHeader onBack={onCancel} />
			
			<FeedingForm 
				newFeeding={newFeeding}
				onUpdateFeeding={onUpdateFeeding}
			/>
			
			<FeedingActions 
				onCancel={onCancel}
				onSave={onSaveFeeding}
			/>
		</motion.div>
	)
}

export default Feeding