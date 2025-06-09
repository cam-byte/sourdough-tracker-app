import React from 'react'
import { motion } from 'framer-motion'
import { CroissantIcon as Bread } from 'lucide-react'
import type { BakingRecord } from '../../types'

interface BakingRecordCardProps {
	baking: BakingRecord
	index?: number
}

const BakingRecordCard: React.FC<BakingRecordCardProps> = ({ baking, index = 0 }) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
			exit={{ opacity: 0, y: -20 }}
			className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm hover:shadow-md transition-shadow"
		>
			<div className="flex items-center justify-between mb-4">
				<span className="font-medium text-amber-900">
					{new Date(baking.date).toLocaleDateString()}
				</span>
				<div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-xs">
					<Bread size={12} />
					{baking.starterName}
				</div>
			</div>

			{baking.result && (
				<div className="mb-4 bg-green-50 text-green-700 p-3 rounded-lg">
					<strong>Result:</strong> {baking.result}
				</div>
			)}

			{baking.notes && (
				<div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
					{baking.notes}
				</div>
			)}
		</motion.div>
	)
}

export default BakingRecordCard