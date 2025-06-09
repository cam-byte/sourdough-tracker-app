import React from 'react'
import { CheckIcon } from 'lucide-react'
import type { Starter, Recipe } from '../../types'

interface StarterCardProps {
	starter: Starter
	recipes: Recipe[]
	isSelected: boolean
	isOverdue: boolean
	isActive: boolean
	isFavorite: boolean
	onToggleSelection: () => void
	onUpdateName: (name: string) => void
	onUpdateRecipe: (recipeId: number) => void
	onViewDetails: () => void
	onToggleFavorite: () => void
}

const StarterCard: React.FC<StarterCardProps> = ({
	starter,
	recipes,
	isSelected,
	isOverdue,
	isActive,
	isFavorite,
	onToggleSelection,
	onUpdateName,
	onUpdateRecipe,
	onViewDetails,
	onToggleFavorite,
}) => {
	return (
		<div
			className={`bg-white rounded-2xl p-6 border-2 transition-all ${
				isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
			}`}
			onClick={onToggleSelection}
		>
			{/* Selection Checkbox */}
			<div className="flex items-start justify-between mb-4">
				<div
					className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
						isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300"
					}`}
				>
					{isSelected && <CheckIcon size={16} />}
				</div>

				<div className="flex gap-2">
					{isOverdue && (
						<div className="bg-red-100 text-red-700 px-2 py-1 rounded-lg text-xs font-medium">
							Overdue
						</div>
					)}
					{isActive && (
						<div className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-medium">
							Active
						</div>
					)}
					{isFavorite && (
						<div className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg text-xs font-medium">
							⭐ Favorite
						</div>
					)}
				</div>
			</div>

			{/* Starter Info */}
			<div className="space-y-4">
				<div>
					<input
						type="text"
						value={starter.name}
						onChange={(e) => {
							e.stopPropagation()
							onUpdateName(e.target.value)
						}}
						onClick={(e) => e.stopPropagation()}
						className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:bg-white focus:border focus:border-blue-500 rounded-lg px-2 py-1 w-full"
					/>
					<p className="text-sm text-gray-600 mt-1">
						Created: {new Date(starter.created).toLocaleDateString()}
					</p>
				</div>

				<div className="grid grid-cols-2 gap-4 text-sm">
					<div>
						<span className="text-gray-600">Last fed:</span>
						<p className="font-medium text-gray-900">
							{starter.lastFed ? new Date(starter.lastFed).toLocaleDateString() : "Never"}
						</p>
					</div>
					<div>
						<span className="text-gray-600">Schedule:</span>
						<p className="font-medium text-gray-900">{starter.feedingSchedule}h</p>
					</div>
				</div>

				{/* Recipe Selector */}
				<div>
					<label className="block text-sm text-gray-600 mb-1">Linked Recipe</label>
					<select
						value={starter.recipe?.id || 0}
						onChange={(e) => {
							e.stopPropagation()
							onUpdateRecipe(Number(e.target.value))
						}}
						onClick={(e) => e.stopPropagation()}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					>
						<option value={0}>No Recipe</option>
						{recipes.map((recipe) => (
							<option key={recipe.id} value={recipe.id}>
								{recipe.name}
							</option>
						))}
					</select>
				</div>

				{/* Action Buttons */}
				<div className="flex gap-2 pt-2">
					<button
						onClick={(e) => {
							e.stopPropagation()
							onViewDetails()
						}}
						className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
					>
						View Details
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation()
							onToggleFavorite()
						}}
						className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
							isFavorite
								? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
								: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
						}`}
					>
						{isFavorite ? '★' : '☆'}
					</button>
				</div>
			</div>
		</div>
	)
}

export default StarterCard