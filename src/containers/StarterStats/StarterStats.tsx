import React from 'react'
import { TrendingUp } from 'lucide-react'
import type { Starter } from '../../types'

interface StarterStatsProps {
	starter: Starter
}

const StarterStats: React.FC<StarterStatsProps> = ({ starter }) => {
	return (
		<div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
			<div className="flex items-center gap-3 mb-6">
				<TrendingUp className="text-purple-600" size={24} />
				<h3 className="text-xl font-semibold text-gray-900">Stats</h3>
			</div>
			<div className="space-y-3">
				<div className="flex justify-between">
					<span className="text-gray-600">Total Feedings</span>
					<span className="font-semibold">{starter.feedingHistory.length}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-gray-600">Notes</span>
					<span className="font-semibold">{starter.notes.length}</span>
				</div>
			</div>
		</div>
	)
}

export default StarterStats