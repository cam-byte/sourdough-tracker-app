import React, { useState, useMemo } from "react"
import {
	Search,
	Star,
	StarOff,
	Trash2,
	BookOpen,
	X,
	CheckSquare,
	Square,
	MoreVertical,
	Edit3,
	Copy,
	AlertCircle,
	Filter,
	SortAsc,
	SortDesc,
	Clock,
	Calendar,
	Wheat,
	ChefHat,
	Heart,
} from "lucide-react"
import type { Starter } from "../../types"

// Portal Popup Component
interface PortalPopupProps {
	isOpen: boolean
	onClose: () => void
	children: React.ReactNode
}

const PortalPopup: React.FC<PortalPopupProps> = ({ isOpen, onClose, children }) => {
	if (!isOpen) return null

	return (
		<div
			className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
			onClick={onClose}
		>
			<div
				className="bg-white rounded-3xl shadow-2xl border-2 border-amber-300 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				{children}
			</div>
		</div>
	)
}

interface StarterManagementPopupProps {
	isOpen: boolean
	onClose: () => void
	starters: Starter[]
	activeStarter?: number | null
	onActiveStarterChange?: (starterId: number) => void
	onDeleteStarters?: (starterIds: number[]) => void
	onToggleFavorite?: (starterId: number) => void
	onEditStarter?: (starterId: number) => void
	onDuplicateStarter?: (starterId: number) => void
	onViewRecipe?: (recipeId: number) => void
}

type SortField = "name" | "created" | "lastFed" | "feedingSchedule"
type SortDirection = "asc" | "desc"
type DateFilterType = "all" | "week" | "month" | "overdue"

// Consolidated state interface
interface FilterState {
	searchTerm: string
	dateFilter: DateFilterType
	showFilters: boolean
	sortField: SortField
	sortDirection: SortDirection
	selectedStarters: Set<number>
}

const StarterManagementPopup: React.FC<StarterManagementPopupProps> = ({
	isOpen,
	onClose,
	starters = [],
	activeStarter,
	onActiveStarterChange,
	onDeleteStarters,
	onToggleFavorite,
	onEditStarter,
	onDuplicateStarter,
	onViewRecipe,
}) => {
	// Consolidated state
	const [filterState, setFilterState] = useState<FilterState>({
		searchTerm: "",
		dateFilter: "all",
		showFilters: false,
		sortField: "name",
		sortDirection: "asc",
		selectedStarters: new Set(),
	})

	// State update helpers
	const updateFilterState = (updates: Partial<FilterState>) => {
		setFilterState(prev => ({ ...prev, ...updates }))
	}

	const isOverdue = (starter: Starter): boolean => {
		if (!starter.lastFed || !starter.feedingSchedule) return false

		const lastFed = new Date(starter.lastFed)
		const nextFeeding = new Date(lastFed.getTime() + starter.feedingSchedule * 60 * 60 * 1000)
		return new Date() > nextFeeding
	}

	const getTimeSinceLastFed = (starter: Starter): string => {
		if (!starter.lastFed) return "Never"

		const lastFed = new Date(starter.lastFed)
		const now = new Date()
		const diffInHours = Math.floor((now.getTime() - lastFed.getTime()) / (1000 * 60 * 60))

		if (diffInHours < 24) {
			return `${diffInHours}h ago`
		} else {
			const days = Math.floor(diffInHours / 24)
			return `${days}d ago`
		}
	}

	const filteredAndSortedStarters = useMemo(() => {
		const filtered = starters.filter((starter) => {
			let notesText = ""
			if (typeof starter.notes === "string") {
				notesText = starter.notes
			} else {
				notesText = Array.isArray(starter.notes) ? starter.notes.map((n) => n.text).join(" ") : ""
			}

			const matchesSearch =
				starter.name.toLowerCase().includes(filterState.searchTerm.toLowerCase()) ||
				notesText.toLowerCase().includes(filterState.searchTerm.toLowerCase())

			if (!matchesSearch) return false

			const now = new Date()
			const created = new Date(starter.created)

			switch (filterState.dateFilter) {
				case "week": {
					const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
					return created >= weekAgo
				}
				case "month": {
					const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
					return created >= monthAgo
				}
				case "overdue":
					return isOverdue(starter)
				default:
					return true
			}
		})

		filtered.sort((a, b) => {
			let aValue: string | number, bValue: string | number

			switch (filterState.sortField) {
				case "name":
					aValue = a.name.toLowerCase()
					bValue = b.name.toLowerCase()
					break
				case "created":
					aValue = new Date(a.created).getTime()
					bValue = new Date(b.created).getTime()
					break
				case "lastFed":
					aValue = a.lastFed ? new Date(a.lastFed).getTime() : 0
					bValue = b.lastFed ? new Date(b.lastFed).getTime() : 0
					break
				case "feedingSchedule":
					aValue = a.feedingSchedule
					bValue = b.feedingSchedule
					break
				default:
					return 0
			}

			if (aValue < bValue) return filterState.sortDirection === "asc" ? -1 : 1
			if (aValue > bValue) return filterState.sortDirection === "asc" ? 1 : -1
			return 0
		})

		return filtered.sort((a, b) => {
			// Handle optional isFavorite property
			const aFavorite = a.isFavorite || false
			const bFavorite = b.isFavorite || false
			if (aFavorite && !bFavorite) return -1
			if (!aFavorite && bFavorite) return 1
			return 0
		})
	}, [starters, filterState.searchTerm, filterState.dateFilter, filterState.sortField, filterState.sortDirection])

	// Event handlers
	const handleSelectAll = () => {
		if (filterState.selectedStarters.size === filteredAndSortedStarters.length) {
			updateFilterState({ selectedStarters: new Set() })
		} else {
			updateFilterState({ selectedStarters: new Set(filteredAndSortedStarters.map((s) => s.id)) })
		}
	}

	const handleSelectStarter = (starterId: number) => {
		const newSelected = new Set(filterState.selectedStarters)
		if (newSelected.has(starterId)) {
			newSelected.delete(starterId)
		} else {
			newSelected.add(starterId)
		}
		updateFilterState({ selectedStarters: newSelected })
	}

	const handleDeleteSelected = () => {
		if (filterState.selectedStarters.size > 0 && onDeleteStarters) {
			onDeleteStarters(Array.from(filterState.selectedStarters))
			updateFilterState({ selectedStarters: new Set() })
		}
	}

	const handleSort = (field: SortField) => {
		if (filterState.sortField === field) {
			updateFilterState({ sortDirection: filterState.sortDirection === "asc" ? "desc" : "asc" })
		} else {
			updateFilterState({ sortField: field, sortDirection: "asc" })
		}
	}

	const SortIcon = ({ field }: { field: SortField }) => {
		if (filterState.sortField !== field) return null
		return filterState.sortDirection === "asc" ? <SortAsc size={14} /> : <SortDesc size={14} />
	}

	return (
		<PortalPopup isOpen={isOpen} onClose={onClose}>
			{/* Decorative Header Background */}
			<div className="relative bg-amber-600 px-6 py-4 flex-shrink-0">
				<div className="absolute inset-0 opacity-20" style={{
					backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255,255,255,0.2) 2px, transparent 0), radial-gradient(circle at 75px 75px, rgba(255,255,255,0.1) 2px, transparent 0)',
					backgroundSize: '100px 100px'
				}}></div>

				<div className="relative flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="bg-white/20 backdrop-blur-sm rounded-2xl p-2">
							<Wheat className="w-6 h-6 text-white" />
						</div>
						<div>
							<h2 className="text-2xl font-bold text-white mb-1">Starter Collection</h2>
							<p className="text-amber-100 text-sm">Manage your sourdough family</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-2 transition-colors hover:scale-110"
					>
						<X size={20} className="text-white" />
					</button>
				</div>
			</div>

			<div className="flex-1 overflow-hidden flex flex-col bg-amber-50">
				<div className="p-6 flex-shrink-0">
					{/* Search and Filters */}
					<div className="space-y-4 mb-6">
						{/* Search Bar */}
						<div className="relative">
							<div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500">
								<Search size={18} />
							</div>
							<input
								type="text"
								placeholder="Search your starters..."
								value={filterState.searchTerm}
								onChange={(e) => updateFilterState({ searchTerm: e.target.value })}
								className="w-full !pl-10 pr-4 py-3 bg-white border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all text-amber-900 placeholder-amber-500 shadow-sm"
							/>
						</div>

						{/* Filter Controls */}
						<div className="flex flex-wrap items-center gap-3">
							<button
								onClick={() => updateFilterState({ showFilters: !filterState.showFilters })}
								className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all shadow-sm text-sm hover:scale-105 ${filterState.showFilters
									? 'bg-amber-500 text-white'
									: 'bg-white text-amber-700 hover:bg-amber-100 border border-amber-300'
									}`}
							>
								<Filter size={16} />
								Filters
							</button>

							<div className="relative">
								<select
									value={filterState.dateFilter}
									onChange={(e) => updateFilterState({ dateFilter: e.target.value as DateFilterType })}
									className="appearance-none px-4 py-2 pr-8 bg-white border border-amber-300 rounded-xl text-amber-700 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all shadow-sm text-sm min-w-0"
								>
									<option value="all">All Time</option>
									<option value="week">This Week</option>
									<option value="month">This Month</option>
									<option value="overdue">Needs Feeding</option>
								</select>
								<Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 text-amber-500 pointer-events-none" size={14} />
							</div>

							<div className="flex-1 min-w-0" />

							{/* Bulk Actions */}
							{filterState.selectedStarters.size > 0 && (
								<div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl shadow-sm">
									<span className="font-medium text-sm whitespace-nowrap">
										{filterState.selectedStarters.size} selected
									</span>
									<button
										onClick={handleDeleteSelected}
										className="flex items-center gap-1 bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg transition-colors font-medium text-sm hover:scale-105"
									>
										<Trash2 size={14} />
										Delete
									</button>
								</div>
							)}
						</div>

						{/* Advanced Filters */}
						{filterState.showFilters && (
							<div className="bg-amber-100 rounded-xl p-4 border border-amber-300 shadow-sm">
								<div className="flex items-center gap-2 mb-3">
									<ChefHat className="text-amber-600" size={18} />
									<h4 className="font-bold text-amber-900">Sort Options</h4>
								</div>
								<div className="flex flex-wrap gap-2">
									{[
										{ field: 'name' as SortField, label: 'Name', icon: Wheat },
										{ field: 'created' as SortField, label: 'Created', icon: Calendar },
										{ field: 'lastFed' as SortField, label: 'Last Fed', icon: Clock },
										{ field: 'feedingSchedule' as SortField, label: 'Schedule', icon: Heart }
									].map(({ field, label, icon: Icon }) => (
										<button
											key={field}
											onClick={() => handleSort(field)}
											className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all shadow-sm text-sm hover:scale-105 ${filterState.sortField === field
												? 'bg-amber-500 text-white'
												: 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-300'
												}`}
										>
											<Icon size={14} />
											{label}
											<SortIcon field={field} />
										</button>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Select All */}
					<div className="flex items-center gap-3 mb-4 pb-3 !ml-4 !mr-4">
						<button
							onClick={handleSelectAll}
							className="flex items-center gap-2 text-amber-700 hover:text-amber-900 font-medium text-sm hover:scale-105"
						>
							{filterState.selectedStarters.size === filteredAndSortedStarters.length && filteredAndSortedStarters.length > 0 ? (
								<CheckSquare size={18} className="text-blue-600" />
							) : (
								<Square size={18} />
							)}
							Select All ({filteredAndSortedStarters.length})
						</button>
					</div>
				</div>

				{/* Starters List - Fixed Height Container */}
				<div className="flex-1 overflow-y-auto px-6 pb-6">
					<div className="min-h-[400px]"> {/* Fixed minimum height to prevent layout shift */}
						{filteredAndSortedStarters.length > 0 ? (
							<div className="space-y-3">
								{filteredAndSortedStarters.map((starter) => {
									const overdue = isOverdue(starter)
									const isSelected = filterState.selectedStarters.has(starter.id)
									const isActive = activeStarter === starter.id

									return (
										<div
											key={starter.id}
											className={`group relative p-4 rounded-xl border transition-all duration-300 shadow-sm hover:shadow-md ${isActive
												? 'border-amber-400 bg-amber-100'
												: isSelected
													? 'border-blue-400 bg-blue-50'
													: 'border-amber-300 bg-white hover:border-amber-400 hover:bg-amber-50'
												}`}
										>
											{/* Selection Glow Effect */}
											{(isSelected || isActive) && (
												<div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/10 to-orange-400/10 pointer-events-none" />
											)}

											<div className="relative flex items-start gap-3">
												{/* Checkbox */}
												<button
													onClick={() => handleSelectStarter(starter.id)}
													className="mt-1 p-1 flex-shrink-0 hover:scale-105"
												>
													{isSelected ? (
														<CheckSquare size={18} className="text-blue-600" />
													) : (
														<Square size={18} className="text-amber-400 hover:text-amber-600 transition-colors" />
													)}
												</button>

												{/* Starter Info */}
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 mb-2 flex-wrap">
														<h3 className="font-bold text-lg text-amber-900 truncate">
															{starter.name}
														</h3>

														<div className="flex items-center gap-1 flex-shrink-0">
															{starter.isFavorite && (
																<div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-1 rounded-full">
																	<Star size={12} className="text-white fill-current" />
																</div>
															)}

															{isActive && (
																<span className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full">
																	Active
																</span>
															)}

															{overdue && (
																<div className="bg-gradient-to-r from-red-500 to-pink-500 p-1 rounded-full">
																	<AlertCircle size={12} className="text-white" />
																</div>
															)}
														</div>
													</div>

													<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
														<div className="space-y-1">
															<div className="flex items-center gap-2 text-amber-700">
																<Calendar size={12} />
																<span className="font-medium">Created:</span>
																<span>{new Date(starter.created).toLocaleDateString()}</span>
															</div>
															<div className={`flex items-center gap-2 ${overdue ? 'text-red-600 font-bold' : 'text-amber-700'}`}>
																<Clock size={12} />
																<span className="font-medium">Last fed:</span>
																<span>{getTimeSinceLastFed(starter)}</span>
															</div>
														</div>
														<div className="space-y-1">
															<div className="flex items-center gap-2 text-amber-700">
																<Heart size={12} />
																<span className="font-medium">Schedule:</span>
																<span>Every {starter.feedingSchedule}h</span>
															</div>
															{starter.notes && (
																<div className="flex items-start gap-2 text-amber-600">
																	<BookOpen size={12} className="mt-0.5 flex-shrink-0" />
																	<span className="text-xs italic line-clamp-1">
																		{typeof starter.notes === 'string'
																			? `"${starter.notes}"`
																			: Array.isArray(starter.notes)
																				? `${starter.notes.length} note${starter.notes.length > 1 ? 's' : ''}`
																				: ''
																		}
																	</span>
																</div>
															)}
														</div>
													</div>
												</div>

												{/* Actions */}
												<div className="flex items-center gap-1 flex-shrink-0">
													{/* Set Active */}
													{!isActive && (
														<button
															onClick={() => onActiveStarterChange?.(starter.id)}
															className="p-2 hover:bg-green-100 rounded-lg transition-colors group/btn hover:scale-105"
															title="Set as active starter"
														>
															<CheckSquare size={16} className="text-green-600 group-hover/btn:text-green-700" />
														</button>
													)}

													{/* Favorite */}
													<button
														onClick={() => onToggleFavorite?.(starter.id)}
														className="p-2 hover:bg-yellow-100 rounded-lg transition-colors group/btn hover:scale-105"
														title={starter.isFavorite ? "Remove from favorites" : "Add to favorites"}
													>
														{starter.isFavorite ? (
															<Star size={16} className="text-yellow-500 fill-current group-hover/btn:text-yellow-600" />
														) : (
															<StarOff size={16} className="text-amber-400 group-hover/btn:text-amber-600" />
														)}
													</button>

													{/* Recipe Link */}
													{starter.recipe && (
														<button
															onClick={() => onViewRecipe?.(starter?.recipe?.id || 0)}
															className="p-2 hover:bg-blue-100 rounded-lg transition-colors group/btn hover:scale-105"
															title="View recipe"
														>
															<BookOpen size={16} className="text-blue-600 group-hover/btn:text-blue-700" />
														</button>
													)}

													{/* More Actions */}
													<div className="relative group/menu">
														<button className="p-2 hover:bg-amber-100 rounded-lg transition-colors hover:scale-105">
															<MoreVertical size={16} className="text-amber-600" />
														</button>

														{/* Dropdown Menu */}
														<div className="absolute right-0 top-full mt-1 bg-white border border-amber-200 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20 min-w-32">
															<button
																onClick={() => onEditStarter?.(starter.id)}
																className="w-full px-3 py-2 text-left text-amber-700 hover:bg-amber-50 flex items-center gap-2 font-medium transition-colors text-sm"
															>
																<Edit3 size={14} />
																Edit
															</button>
															<button
																onClick={() => onDuplicateStarter?.(starter.id)}
																className="w-full px-3 py-2 text-left text-amber-700 hover:bg-amber-50 flex items-center gap-2 font-medium transition-colors text-sm"
															>
																<Copy size={14} />
																Duplicate
															</button>
															<div className="h-px bg-amber-200 mx-2 my-1" />
															<button
																onClick={() => onDeleteStarters?.([starter.id])}
																className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium transition-colors text-sm"
															>
																<Trash2 size={14} />
																Delete
															</button>
														</div>
													</div>
												</div>
											</div>
										</div>
									)
								})}
							</div>
						) : (
							/* Empty State - Centered in fixed height container */
							<div className="flex items-center justify-center h-full">
								<div className="text-center">
									<div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
										<Search size={28} className="text-amber-500" />
									</div>
									<h3 className="text-lg font-bold text-amber-900 mb-2">No starters found</h3>
									<p className="text-amber-600 text-sm">Try adjusting your search or filter criteria</p>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Footer */}
				<div className="p-6 pt-4 border-t border-amber-200 flex justify-between items-center bg-amber-50 flex-shrink-0">
					<div className="flex items-center gap-2 text-amber-700">
						<Wheat size={18} />
						<span className="font-semibold text-sm">
							{filteredAndSortedStarters.length} of {starters.length} starters
						</span>
					</div>
					<button
						onClick={onClose}
						className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm hover:scale-105"
					>
						Done
					</button>
				</div>
			</div>
		</PortalPopup>
	)
}

export default StarterManagementPopup