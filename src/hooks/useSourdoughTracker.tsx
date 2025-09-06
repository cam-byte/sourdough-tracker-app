import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import type { Starter, Recipe, NewFeeding, NewBaking, ViewType, Feeding, Note } from '../types'
import { useAuth } from './useAuth'


export const useSourdoughTracker = () => {
	// State for data from MongoDB
	const [starters, setStarters] = useState<Starter[]>([])
	const [recipes, setRecipes] = useState<Recipe[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()

	// UI state (not persisted - resets on refresh)
	const [uiState, setUiState] = useState({
		activeStarter: null as number | null,
		activeRecipe: null as number | null,
		view: "dashboard" as ViewType,
		showModal: false,
		showStarterPopup: false,
		searchTerm: "",
		dateFilter: { start: "", end: "" },
		selectedStarters: [] as number[],
		editingFeeding: null as Feeding | null,
		editingNote: null as Note | null,
	})

	// Form states (not persisted)
	const [newFeeding, setNewFeeding] = useState<NewFeeding>({
		date: new Date().toISOString().split("T")[0],
		time: new Date().toTimeString().slice(0, 5),
		flour: 100,
		flourType: "AP",
		water: 100,
		temp: 75,
		note: "",
	})

	const [newBaking, setNewBaking] = useState<NewBaking>({
		date: new Date().toISOString().split("T")[0],
		starterId: 0,
		notes: "",
		result: "",
	})

	const [newNote, setNewNote] = useState<string>("")
	const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>({
		name: "",
		ingredients: "",
		instructions: "",
		bakingHistory: [],
	})

	// UI state update helper
	const updateUiState = useCallback((updates: Partial<typeof uiState>) => {
		setUiState(prev => ({ ...prev, ...updates }))
	}, [])

	// Data fetching functions
	const fetchStarters = async () => {
		try {
			setLoading(true)
			setError(null)
			const startersData = await api.getAllStarters() // ← Changed to api
			setStarters(startersData)
			
			// Set active starter if none is set
			if (startersData.length > 0 && !uiState.activeStarter) {
				updateUiState({ activeStarter: startersData[0].id })
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to fetch starters')
			console.error('Error fetching starters:', err)
		} finally {
			setLoading(false)
		}
	}

	const fetchRecipes = async () => {
		try {
			// Note: You'll need to implement recipe endpoints in your backend
			// For now, keeping recipes in localStorage as fallback
			const savedRecipes = localStorage.getItem('bread-lab-recipes')
			if (savedRecipes) {
				setRecipes(JSON.parse(savedRecipes))
			} else {
				// Default recipe
				setRecipes([{
					id: 1,
					name: "Basic Sourdough Loaf",
					ingredients: "500g bread flour\n350g water\n100g active starter\n10g salt",
					instructions: "1. Mix flour, water, and starter. Let rest for 30 minutes.\n2. Add salt and knead briefly.\n3. Bulk ferment for 4-6 hours with folds every hour.\n4. Shape and cold proof overnight.\n5. Bake at 450°F for 20 minutes with lid on, 20 minutes with lid off.",
					bakingHistory: [],
				}])
			}
		} catch (err) {
			console.error('Error fetching recipes:', err)
		}
	}

	// Initial data load
	useEffect(() => {
		const loadData = async () => {
			await Promise.all([fetchStarters(), fetchRecipes()])
		}
		loadData()
	}, [])

	// Set active starter when starters load
	useEffect(() => {
		if (starters.length > 0 && !uiState.activeStarter) {
			updateUiState({ activeStarter: starters[0].id })
		}
	}, [starters, uiState.activeStarter, updateUiState])

	// Set active recipe when recipes load
	useEffect(() => {
		if (recipes.length > 0 && !uiState.activeRecipe) {
			updateUiState({ activeRecipe: recipes[0].id })
		}
	}, [recipes, uiState.activeRecipe, updateUiState])

	useEffect(() => {
		if (uiState.view === "editRecipe") {
			const recipe = recipes.find((r) => r.id === uiState.activeRecipe)
			if (recipe) {
				setNewRecipe({
					name: recipe.name,
					ingredients: recipe.ingredients,
					instructions: recipe.instructions,
				})
			}
		}
	}, [uiState.view, uiState.activeRecipe, recipes])

	// Helper functions
	const getActiveStarterData = (): Starter | undefined => {
		return starters.find((s: Starter) => s.id === uiState.activeStarter) || starters[0]
	}

	const getActiveRecipeData = (): Recipe | undefined => {
		return recipes.find((r: Recipe) => r.id === uiState.activeRecipe) || recipes[0]
	}

	// Refresh single starter data
	const refreshStarter = async (starterId: number) => {
		try {
			const updatedStarter = await api.getStarter(starterId) // ← Changed to api
			setStarters(prev => prev.map(s => s.id === starterId ? updatedStarter : s))
		} catch (err) {
			console.error('Error refreshing starter:', err)
		}
	}

	// Core feeding functions
	const addFeeding = async (): Promise<void> => {
		if (!uiState.activeStarter) return

		try {
			const feedingData = {
				flour: newFeeding.flour,
				water: newFeeding.water,
				notes: newFeeding.note,
				// You might want to store additional data like flourType, temp, etc.
				flourType: newFeeding.flourType,
				temp: newFeeding.temp
			}

			await api.addFeeding(uiState.activeStarter, feedingData)
			await refreshStarter(uiState.activeStarter)

			// Reset form
			setNewFeeding({
				date: new Date().toISOString().split("T")[0],
				time: new Date().toTimeString().slice(0, 5),
				flour: 100,
				flourType: "AP",
				water: 100,
				temp: 75,
				note: "",
			})
			updateUiState({ view: "dashboard" })
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to add feeding')
			console.error('Error adding feeding:', err)
		}
	}

	// Edit feeding function
	const editFeeding = async (feedingId: number, updatedFeeding: Partial<Feeding>): Promise<void> => {
		if (!uiState.activeStarter) return

		try {
			await api.updateFeeding(uiState.activeStarter, feedingId, updatedFeeding)
			await refreshStarter(uiState.activeStarter)
			updateUiState({ editingFeeding: null })
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to update feeding')
			console.error('Error updating feeding:', err)
		}
	}

	// Delete feeding function
	const deleteFeeding = async (feedingId: number): Promise<void> => {
		if (!uiState.activeStarter) return
		
		if (window.confirm('Are you sure you want to delete this feeding record?')) {
			try {
				await api.deleteFeeding(uiState.activeStarter, feedingId)
				await refreshStarter(uiState.activeStarter)
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to delete feeding')
				console.error('Error deleting feeding:', err)
			}
		}
	}

	// Start editing feeding
	const startEditingFeeding = (feeding: Feeding): void => {
		updateUiState({ editingFeeding: feeding })
	}

	// Cancel editing feeding
	const cancelEditingFeeding = (): void => {
		updateUiState({ editingFeeding: null })
	}

	// Core note functions
	const addNote = async (): Promise<void> => {
		if (!newNote.trim() || !uiState.activeStarter) return

		try {
			await api.addNote(uiState.activeStarter, newNote)
			await refreshStarter(uiState.activeStarter)
			setNewNote("")
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to add note')
			console.error('Error adding note:', err)
		}
	}

	// Edit note function
	const editNote = async (noteId: number, updatedText: string): Promise<void> => {
		if (!uiState.activeStarter) return

		try {
			await api.updateNote(uiState.activeStarter, noteId, updatedText)
			await refreshStarter(uiState.activeStarter)
			updateUiState({ editingNote: null })
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to update note')
			console.error('Error updating note:', err)
		}
	}

	// Delete note function
	const deleteNote = async (noteId: number): Promise<void> => {
		if (!uiState.activeStarter) return
		
		if (window.confirm('Are you sure you want to delete this note?')) {
			try {
				await api.deleteNote(uiState.activeStarter, noteId)
				await refreshStarter(uiState.activeStarter)
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to delete note')
				console.error('Error deleting note:', err)
			}
		}
	}

	// Start editing note
	const startEditingNote = (note: Note): void => {
		updateUiState({ editingNote: note })
	}

	// Cancel editing note
	const cancelEditingNote = (): void => {
		updateUiState({ editingNote: null })
	}

	// Starter management functions
	const addNewStarter = async (): Promise<void> => {
		try {
			const newStarter = await api.createStarter({
                user_id: user ? user.id : 0,
				name: `Starter #${starters.length + 1}`,
				feedingSchedule: 24
			})
			
			setStarters(prev => [...prev, newStarter])
			updateUiState({ activeStarter: newStarter.id })
			scheduleNotification(newStarter)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to create starter')
			console.error('Error creating starter:', err)
		}
	}

	const deleteStarters = async (starterIds: number[]): Promise<void> => {
		try {
			// Delete each starter from the database
			await Promise.all(starterIds.map(id => api.deleteStarter(id)))
			
			// Update local state
			const updatedStarters = starters.filter((s: Starter) => !starterIds.includes(s.id))
			setStarters(updatedStarters)
			
			if (uiState.activeStarter && starterIds.includes(uiState.activeStarter)) {
				const newActiveStarter = updatedStarters.length > 0 ? updatedStarters[0].id : null
				updateUiState({ activeStarter: newActiveStarter })
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to delete starters')
			console.error('Error deleting starters:', err)
		}
	}

	const toggleFavorite = async (starterId: number): Promise<void> => {
		try {
			const starter = starters.find(s => s.id === starterId)
			if (!starter) return

			await api.updateStarter(starterId, { isFavorite: !starter.isFavorite })
			await refreshStarter(starterId)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to update favorite')
			console.error('Error toggling favorite:', err)
		}
	}

	const duplicateStarter = async (starterId: number): Promise<void> => {
		try {
			const starterToDupe = starters.find((s: Starter) => s.id === starterId)
			if (!starterToDupe) return

			const duplicatedStarter = await api.createStarter({
                user_id: user ? user.id : 0,
				name: `${starterToDupe.name} (Copy)`,
				feedingSchedule: starterToDupe.feedingSchedule
			})
			
			setStarters(prev => [...prev, duplicatedStarter])
			scheduleNotification(duplicatedStarter)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to duplicate starter')
			console.error('Error duplicating starter:', err)
		}
	}

	const updateStarterName = async (name: string, starterId?: number): Promise<void> => {
		const targetId = starterId || uiState.activeStarter
		if (!targetId) return

		try {
			await api.updateStarter(targetId, { name })
			await refreshStarter(targetId)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to update starter name')
			console.error('Error updating starter name:', err)
		}
	}

	const updateFeedingSchedule = async (hours: number, starterId?: number): Promise<void> => {
		const targetId = starterId || uiState.activeStarter
		if (!targetId) return

		try {
			await api.updateStarter(targetId, { feedingSchedule: hours })
			const updatedStarter = await api.getStarter(targetId)
			setStarters(prev => prev.map(s => s.id === targetId ? updatedStarter : s))
			scheduleNotification(updatedStarter)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to update feeding schedule')
			console.error('Error updating feeding schedule:', err)
		}
	}

	const updateStarterRecipe = async (recipeId: number, starterId?: number): Promise<void> => {
		const targetId = starterId || uiState.activeStarter
		if (!targetId) return

		try {
			const recipeToUse = recipes.find((r: Recipe) => r.id === recipeId)
			await api.updateStarter(targetId, { 
				recipe: recipeId ? recipeToUse || null : null 
			})
			await refreshStarter(targetId)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to update starter recipe')
			console.error('Error updating starter recipe:', err)
		}
	}

	// Popup management functions
	const openStarterManagement = () => {
		updateUiState({ showStarterPopup: true })
	}

	const closeStarterManagement = () => {
		updateUiState({ showStarterPopup: false })
	}

	const setActiveStarter = (starterId: number) => {
		updateUiState({ activeStarter: starterId })
	}

	// Notification system (unchanged)
	const scheduleNotification = useCallback((starter: Starter) => {
		if ('serviceWorker' in navigator && 'Notification' in window && Notification.permission === 'granted') {
			const lastFed = new Date(starter.lastFed)
			const nextFeeding = new Date(lastFed.getTime() + starter.feedingSchedule * 60 * 60 * 1000)
			const now = new Date()

			if (nextFeeding > now) {
				const delay = nextFeeding.getTime() - now.getTime()

				const timeoutId = setTimeout(() => {
					navigator.serviceWorker.ready.then((registration) => {
						const notificationOptions: NotificationOptions = {
							body: 'Your sourdough starter is ready for feeding',
							icon: '/icon-192.png',
							badge: '/icon-192.png',
							tag: `feeding-${starter.id}`,
							requireInteraction: true,
							...(('actions' in Notification.prototype) && {
								actions: [
									{
										action: 'feed-now',
										title: 'Feed Now'
									},
									{
										action: 'snooze',
										title: 'Remind Later'
									}
								]
							})
						}
						
						registration.showNotification(`Time to feed ${starter.name}!`, notificationOptions)
					})
				}, delay)

				return timeoutId
			}
		}
	}, [])

	// Request notification permission
	const requestNotificationPermission = useCallback(async () => {
		if ('Notification' in window) {
			const permission = await Notification.requestPermission()
			return permission === 'granted'
		}
		return false
	}, [])

	// Schedule notifications for all starters on app load
	useEffect(() => {
		starters.forEach((starter: Starter) => scheduleNotification(starter))
	}, [starters, scheduleNotification])

	// Navigation helper for recipe viewing
	const handleViewRecipe = (recipeId: number, onNavigate?: (path: string) => void) => {
		updateUiState({ activeRecipe: recipeId })
		if (onNavigate) {
			onNavigate(`/recipes/${recipeId}`)
		}
	}

	// Clear any errors
	const clearError = () => setError(null)

	return {
		// State
		starters,
		recipes,
		loading,
		error,
		activeStarter: uiState.activeStarter,
		activeRecipe: uiState.activeRecipe,
		newFeeding,
		newBaking,
		newNote,
		newRecipe,
		view: uiState.view,
		showModal: uiState.showModal,
		showStarterPopup: uiState.showStarterPopup,
		searchTerm: uiState.searchTerm,
		dateFilter: uiState.dateFilter,
		selectedStarters: uiState.selectedStarters,
		editingFeeding: uiState.editingFeeding,
		editingNote: uiState.editingNote,

		// Setters (consolidated)
		setStarters,
		setRecipes,
		setNewFeeding,
		setNewBaking,
		setNewNote,
		setNewRecipe,
		updateUiState,

		// Individual setters for backward compatibility
		setActiveStarter,
		setActiveRecipe: (id: number) => updateUiState({ activeRecipe: id }),
		setView: (view: ViewType) => updateUiState({ view }),
		setShowModal: (show: boolean) => updateUiState({ showModal: show }),
		setSearchTerm: (term: string) => updateUiState({ searchTerm: term }),
		setDateFilter: (filter: { start: string; end: string }) => updateUiState({ dateFilter: filter }),
		setSelectedStarters: (ids: number[]) => updateUiState({ selectedStarters: ids }),

		// Helper functions
		getActiveStarterData,
		getActiveRecipeData,

		// Core actions (now async)
		addFeeding,
		addNote,

		// Edit/Delete actions (now async)
		editFeeding,
		deleteFeeding,
		startEditingFeeding,
		cancelEditingFeeding,
		editNote,
		deleteNote,
		startEditingNote,
		cancelEditingNote,

		// Starter management actions (now async)
		addNewStarter,
		deleteStarters,
		toggleFavorite,
		duplicateStarter,
		updateStarterName,
		updateFeedingSchedule,
		updateStarterRecipe,

		// Popup management
		openStarterManagement,
		closeStarterManagement,
		onViewAllStarters: openStarterManagement,

		// Recipe navigation
		handleViewRecipe,

		// Notification system
		scheduleNotification,
		requestNotificationPermission,

		// Data management
		refreshStarter,
		fetchStarters,
		clearError,
	}
}