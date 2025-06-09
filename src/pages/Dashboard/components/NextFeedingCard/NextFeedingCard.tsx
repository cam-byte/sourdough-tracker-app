import React from 'react'
import { Clock } from 'lucide-react'

interface NextFeedingCardProps {
	timeLeft: string
	isOverdue: boolean
	lastFedDate: string
}

const NextFeedingCard: React.FC<NextFeedingCardProps> = ({ timeLeft, isOverdue, lastFedDate }) => {
	return (
		<div
			className={`relative overflow-hidden rounded-3xl p-8 ${
				isOverdue
					? "bg-gradient-to-br from-red-500 to-red-600 text-white"
					: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
			}`}
		>
			<div className="relative z-10">
				<div className="flex items-center gap-3 mb-4">
					<Clock size={24} />
					<h3 className="text-xl font-semibold">Next Feeding</h3>
				</div>
				<p className="text-4xl font-bold mb-2">{timeLeft}</p>
				<p className="text-white/80">Last fed: {new Date(lastFedDate).toLocaleDateString()}</p>
			</div>
			<div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
		</div>
	)
}

export default NextFeedingCard