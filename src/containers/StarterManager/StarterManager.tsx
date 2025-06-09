import React from 'react'
import { XIcon, SearchIcon, CheckIcon, TrashIcon, PlusIcon, BriefcaseMedicalIcon } from 'lucide-react'
import PortalPopup from '../../components/PortalPopup'
import type { Starter, Recipe } from '../../types'
import StarterCard from '../../components/StarterCard'

interface StarterManagerProps {
	isOpen: boolean
	onClose: () => void
	starters: Starter[]
	recipes: Recipe[]
	searchTerm: string
	setSearchTerm: (term: string) => void
	dateFilter: { start: string; end: string }
	setDateFilter: (filter: { start: string; end: string }) => void
	selectedStarters: number[]
	setSelectedStarters: (ids: number[]) => void
	favoriteStarters: number[]
	setFavoriteStarters: (ids: number[]) => void
	activeStarter: number | null
	setActiveStarter: (id: number | null) => void
	setView: (view: string) => void
	setStarters: (starters: Starter[]) => void
	filteredStarters: Starter[]
	toggleAll: () => void
	deleteSelected: () => void
	addNewStarter: () => void
	isOverdue: (starter: Starter) => boolean
}

const StarterManager: React.FC<StarterManagerProps> = ({
	isOpen,
	onClose,
	starters,
	recipes,
	searchTerm,
	setSearchTerm,
	dateFilter,
	setDateFilter,
	selectedStarters,
	setSelectedStarters,
	favoriteStarters,
	setFavoriteStarters,
	activeStarter,
	setActiveStarter,
	setView,
	setStarters,
	filteredStarters,
	toggleAll,
	deleteSelected,
	addNewStarter,
	isOverdue,
}) => {
	const handleStarterNameUpdate = (starterId: number, name: string) => {
		const updatedStarters = starters.map(s =>
			s.id === starterId ? { ...s, name } : s
		)
		setStarters(updatedStarters)
	}

	const handleStarterRecipeUpdate = (starterId: number, recipeId: number) => {
		const recipeToUse = recipes.find(r => r.id === recipeId)
		const updatedStarters = starters.map(s =>
			s.id === starterId ? { ...s, recipe: recipeId ? recipeToUse || null : null } : s
		)
		setStarters(updatedStarters)
	}

	const handleToggleSelection = (starterId: number) => {
		if (selectedStarters.includes(starterId)) {
			setSelectedStarters(selectedStarters.filter(id => id !== starterId))
		} else {
			setSelectedStarters([...selectedStarters, starterId])
		}
	}

	const handleToggleFavorite = (starterId: number) => {
		const newFavorites = favoriteStarters.includes(starterId)
			? favoriteStarters.filter(id => id !== starterId)
			: [...favoriteStarters, starterId]
		setFavoriteStarters(newFavorites)
	}

	const handleViewDetails = (starterId: number) => {
		setActiveStarter(starterId)
		onClose()
		setView("dashboard")
	}

	return (
		<PortalPopup isOpen={isOpen} onClose={onClose}>
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
				<div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
					{/* Header */}
					<div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-3xl font-bold">Starter Manager</h2>
								<p className="text-blue-100 mt-1">Manage all your sourdough starters</p>
							</div>
							<button
								onClick={onClose}
								className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors"
							>
								<XIcon />
							</button>
						</div>
					</div>

					{/* Filters */}
					<div className="p-6 border-b border-gray-200">
						<div className="flex flex-col lg:flex-row gap-4">
							<div className="relative flex-1 flex">
								<input
									type="text"
									id="starterSearch"
									placeholder="Search starters..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full !pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
								<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
							</div>

							<div className="flex gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
									<input
										type="date"
										value={dateFilter.start}
										onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
										className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
									<input
										type="date"
										value={dateFilter.end}
										onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
										className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="flex justify-between items-center p-6 border-b border-gray-200">
						<div className="flex gap-3">
							<button
								onClick={toggleAll}
								className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center gap-2"
							>
								<CheckIcon size={16} />
								{selectedStarters.length === filteredStarters.length ? 'Deselect All' : 'Select All'}
							</button>

							{selectedStarters.length > 0 && (
								<button
									onClick={deleteSelected}
									className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
								>
									<TrashIcon size={16} />
									Delete ({selectedStarters.length})
								</button>
							)}
						</div>

						<button
							onClick={addNewStarter}
							className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
						>
							<PlusIcon size={16} />
							New Starter
						</button>
					</div>

					{/* Starter Grid */}
					<div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 280px)' }}>
						{filteredStarters.length === 0 ? (
							<div className="text-center py-12">
								<BriefcaseMedicalIcon size={48} className="text-gray-300 mx-auto mb-4" />
								<h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">
									{searchTerm || dateFilter.start || dateFilter.end ? "No starters found" : "No starters yet"}
								</h3>
								<p className="text-gray-600 mb-6">
									{searchTerm || dateFilter.start || dateFilter.end
										? "Try adjusting your search or filter criteria"
										: "Create your first sourdough starter to get started"}
								</p>
								{!searchTerm && !dateFilter.start && !dateFilter.end && (
									<button
										onClick={addNewStarter}
										className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
									>
										Create First Starter
									</button>
								)}
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{filteredStarters.map((starter) => (
									<StarterCard
										key={starter.id}
										starter={starter}
										recipes={recipes}
										isSelected={selectedStarters.includes(starter.id)}
										isOverdue={isOverdue(starter)}
										isActive={activeStarter === starter.id}
										isFavorite={favoriteStarters.includes(starter.id)}
										onToggleSelection={() => handleToggleSelection(starter.id)}
										onUpdateName={(name) => handleStarterNameUpdate(starter.id, name)}
										onUpdateRecipe={(recipeId) => handleStarterRecipeUpdate(starter.id, recipeId)}
										onViewDetails={() => handleViewDetails(starter.id)}
										onToggleFavorite={() => handleToggleFavorite(starter.id)}
									/>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</PortalPopup>
	)
}

export default StarterManager