import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Thermometer, CroissantIcon as Bread, Droplet, Edit2, Trash2, Save, X } from 'lucide-react'
import type { Feeding } from '../../types'

interface FeedingCardProps {
	feeding: Feeding
	index?: number
	getHydrationPercentage: (feeding: Feeding) => number
	onEdit?: (feedingId: number, updatedFeeding: Partial<Feeding>) => void
	onDelete?: (feedingId: number) => void
}

const FeedingCard: React.FC<FeedingCardProps> = ({ 
	feeding, 
	index = 0, 
	getHydrationPercentage,
	onEdit,
	onDelete
}) => {
	const [isEditing, setIsEditing] = useState(false)
	const [editData, setEditData] = useState({
		flour: feeding.flour || 0,
		water: feeding.water || 0,
		flourType: feeding.flourType || 'AP',
		temp: feeding.temp || 75,
		note: feeding.note || ''
	})

	const handleSave = () => {
		if (onEdit) {
			onEdit(feeding.id, {
				flour: editData.flour,
				water: editData.water,
				flourType: editData.flourType,
				temp: editData.temp,
				note: editData.note
			})
			setIsEditing(false)
		}
	}

	const handleCancel = () => {
		setEditData({
			flour: feeding.flour || 0,
			water: feeding.water || 0,
			flourType: feeding.flourType || 'AP',
			temp: feeding.temp || 75,
			note: feeding.note || ''
		})
		setIsEditing(false)
	}

	const handleDelete = () => {
		if (onDelete) {
			onDelete(feeding.id)
		}
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }}
			exit={{ opacity: 0, y: -20 }}
			className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm hover:shadow-md transition-shadow group"
		>
			<div className="flex items-center justify-between mb-4">
				<span className="text-sm font-medium text-amber-700">
					{new Date(feeding.timestamp).toLocaleDateString()}
				</span>
				
				<div className="flex items-center gap-3">
					{/* Hydration percentage */}
					<div className="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-xs font-medium">
						{getHydrationPercentage(feeding)}% hydration
					</div>

					{/* Action buttons - only show if handlers provided */}
					{(onEdit || onDelete) && !isEditing && (
						<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
							{onEdit && (
								<button
									onClick={() => setIsEditing(true)}
									className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
									title="Edit feeding"
								>
									<Edit2 size={16} />
								</button>
							)}
							{onDelete && (
								<button
									onClick={handleDelete}
									className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
									title="Delete feeding"
								>
									<Trash2 size={16} />
								</button>
							)}
						</div>
					)}

					{/* Save/Cancel buttons during editing */}
					{isEditing && (
						<div className="flex gap-2">
							<button
								onClick={handleSave}
								className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
								title="Save changes"
							>
								<Save size={16} />
							</button>
							<button
								onClick={handleCancel}
								className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
								title="Cancel editing"
							>
								<X size={16} />
							</button>
						</div>
					)}
				</div>
			</div>

			{isEditing ? (
				<div className="space-y-4">
					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-xs font-medium text-amber-700 mb-1">Flour (g)</label>
							<input
								type="number"
								value={editData.flour}
								onChange={(e) => setEditData({ ...editData, flour: Number(e.target.value) })}
								className="w-full p-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50"
							/>
						</div>
						<div>
							<label className="block text-xs font-medium text-amber-700 mb-1">Water (g)</label>
							<input
								type="number"
								value={editData.water}
								onChange={(e) => setEditData({ ...editData, water: Number(e.target.value) })}
								className="w-full p-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50"
							/>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-xs font-medium text-amber-700 mb-1">Flour Type</label>
							<select
								value={editData.flourType}
								onChange={(e) => setEditData({ ...editData, flourType: e.target.value })}
								className="w-full p-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50"
							>
								<option value="AP">All-Purpose</option>
								<option value="Bread">Bread Flour</option>
								<option value="Whole Wheat">Whole Wheat</option>
								<option value="Rye">Rye</option>
								<option value="Spelt">Spelt</option>
								<option value="Einkorn">Einkorn</option>
							</select>
						</div>
						<div>
							<label className="block text-xs font-medium text-amber-700 mb-1">Temp (°F)</label>
							<input
								type="number"
								value={editData.temp}
								onChange={(e) => setEditData({ ...editData, temp: Number(e.target.value) })}
								className="w-full p-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50"
							/>
						</div>
					</div>
					<div>
						<label className="block text-xs font-medium text-amber-700 mb-1">Note</label>
						<textarea
							value={editData.note}
							onChange={(e) => setEditData({ ...editData, note: e.target.value })}
							className="w-full p-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50 resize-none"
							rows={2}
							placeholder="Optional note about this feeding..."
						/>
					</div>
				</div>
			) : (
				<div className="space-y-3">
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm text-amber-700">
							<Bread size={14} className="text-amber-500" />
							<span>{feeding.flourType}: {feeding.flour}g</span>
						</div>
						<div className="flex items-center gap-2 text-sm text-amber-700">
							<Droplet size={14} className="text-blue-500" />
							<span>Water: {feeding.water}g</span>
						</div>
						<div className="flex items-center gap-2 text-sm text-amber-700">
							<Thermometer size={14} className="text-orange-500" />
							<span>Temperature: {feeding.temp}°F</span>
						</div>
					</div>

					{feeding.note && (
						<div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
							<span className="text-xs font-medium text-amber-600">Note:</span>
							<p className="text-amber-800 mt-1 text-sm">{feeding.note}</p>
						</div>
					)}
				</div>
			)}
		</motion.div>
	)
}

export default FeedingCard