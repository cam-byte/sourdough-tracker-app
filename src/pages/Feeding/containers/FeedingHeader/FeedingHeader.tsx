import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { itemVariants } from '../../../../utils/motionVariants'

interface FeedingHeaderProps {
	onBack: () => void
}

const FeedingHeader: React.FC<FeedingHeaderProps> = ({ onBack }) => {
	return (
		<motion.div className="text-center space-y-4" variants={itemVariants}>
			<button
				onClick={onBack}
				className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-800 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-amber-50"
			>
				<ArrowLeft size={20} />
				Back to Dashboard
			</button>
			<h1 className="text-4xl font-bold text-amber-900">Record Feeding</h1>
			<p className="text-amber-700">Log the details of your starter feeding</p>
		</motion.div>
	)
}

export default FeedingHeader