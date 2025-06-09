import { useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { Starter, Recipe, NewFeeding, NewBaking, ViewType, Feeding, Note } from '../types'

export const useSourdoughTracker = () => {
	// Use localStorage for persistent data
	const [starters, setStarters] = useLocalStorage<Starter[]>('bread-lab-starters', [
		{
			id: 1,
			name: "Gertrude",
			created: new Date().toISOString().split("T")[0],
			lastFed: new Date().toISOString().split("T")[0],
			feedingSchedule: 24,
			feedingHistory: [],
			notes: [],
			recipe: null,
			isFavorite: false,
		},
	])

	const [recipes, setRecipes] = useLocalStorage<Recipe[]>('bread-lab-recipes', [
		{
			id: 1,
			name: "Basic Sourdough Loaf",
			ingredients: "500g bread flour\n350g water\n100g active starter\n10g salt",
			instructions:
				"1. Mix flour, water, and starter. Let rest for 30 minutes.\n2. Add salt and knead briefly.\n3. Bulk ferment for 4-6 hours with folds every hour.\n4. Shape and cold proof overnight.\n5. Bake at 450°F for 20 minutes with lid on, 20 minutes with lid off.",
			bakingHistory: [],
		},
	])

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

	useEffect(() => {
		if (starters.length > 0 && !uiState.activeStarter) {
			updateUiState({ activeStarter: starters[0].id })
		}
		if (recipes.length > 0 && !uiState.activeRecipe) {
			updateUiState({ activeRecipe: recipes[0].id })
		}
	}, [starters, recipes, uiState.activeStarter, uiState.activeRecipe, updateUiState])

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

	// Core feeding functions
	const addFeeding = (): void => {
		const updatedStarters = starters.map((starter) => {
			if (starter.id === uiState.activeStarter) {
				const timestamp = `${newFeeding.date}T${newFeeding.time}`
				const updatedStarter = {
					...starter,
					lastFed: newFeeding.date,
					feedingHistory: [
						{
							id: Date.now(),
							timestamp,
							flour: newFeeding.flour,
							flourType: newFeeding.flourType,
							water: newFeeding.water,
							temp: newFeeding.temp,
							note: newFeeding.note,
						},
						...starter.feedingHistory,
					],
				}
				
				scheduleNotification(updatedStarter)
				return updatedStarter
			}
			return starter
		})
		setStarters(updatedStarters)
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
	}

	// Edit feeding function
	const editFeeding = (feedingId: number, updatedFeeding: Partial<Feeding>): void => {
		const updatedStarters = starters.map((starter) => {
			if (starter.id === uiState.activeStarter) {
				const updatedFeedingHistory = starter.feedingHistory.map((feeding) =>
					feeding.id === feedingId ? { ...feeding, ...updatedFeeding } : feeding
				)
				return { ...starter, feedingHistory: updatedFeedingHistory }
			}
			return starter
		})
		setStarters(updatedStarters)
		updateUiState({ editingFeeding: null })
	}

	// Delete feeding function
	const deleteFeeding = (feedingId: number): void => {
		if (window.confirm('Are you sure you want to delete this feeding record?')) {
			const updatedStarters = starters.map((starter) => {
				if (starter.id === uiState.activeStarter) {
					const updatedFeedingHistory = starter.feedingHistory.filter(
						(feeding) => feeding.id !== feedingId
					)
					return { ...starter, feedingHistory: updatedFeedingHistory }
				}
				return starter
			})
			setStarters(updatedStarters)
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
	const addNote = (): void => {
		if (!newNote.trim()) return

		const updatedStarters = starters.map((starter: Starter) => {
			if (starter.id === uiState.activeStarter) {
				return {
					...starter,
					notes: [
						{
							id: Date.now(),
							date: new Date().toISOString(),
							text: newNote,
						},
						...starter.notes,
					],
				}
			}
			return starter
		})
		setStarters(updatedStarters)
		setNewNote("")
	}

	// Edit note function
	const editNote = (noteId: number, updatedText: string): void => {
		const updatedStarters = starters.map((starter) => {
			if (starter.id === uiState.activeStarter) {
				const updatedNotes = starter.notes.map((note) =>
					note.id === noteId ? { ...note, text: updatedText } : note
				)
				return { ...starter, notes: updatedNotes }
			}
			return starter
		})
		setStarters(updatedStarters)
		updateUiState({ editingNote: null })
	}

	// Delete note function
	const deleteNote = (noteId: number): void => {
		if (window.confirm('Are you sure you want to delete this note?')) {
			const updatedStarters = starters.map((starter) => {
				if (starter.id === uiState.activeStarter) {
					const updatedNotes = starter.notes.filter((note) => note.id !== noteId)
					return { ...starter, notes: updatedNotes }
				}
				return starter
			})
			setStarters(updatedStarters)
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
	const addNewStarter = (): void => {
		const newId = Math.max(0, ...starters.map((s: Starter) => s.id)) + 1
		const newStarter: Starter = {
			id: newId,
			name: `Starter #${newId}`,
			created: new Date().toISOString().split("T")[0],
			lastFed: new Date().toISOString().split("T")[0],
			feedingSchedule: 24,
			recipe: null,
			feedingHistory: [],
			notes: [],
			isFavorite: false,
		}
		setStarters([...starters, newStarter])
		updateUiState({ activeStarter: newId })
		scheduleNotification(newStarter)
	}

	const deleteStarters = (starterIds: number[]): void => {
		const updatedStarters = starters.filter((s: Starter) => !starterIds.includes(s.id))
		setStarters(updatedStarters)
		
		if (starterIds.includes(uiState.activeStarter!)) {
			const newActiveStarter = updatedStarters.length > 0 ? updatedStarters[0].id : null
			updateUiState({ activeStarter: newActiveStarter })
		}
	}

	const toggleFavorite = (starterId: number): void => {
		const updatedStarters = starters.map((starter: Starter) => 
			starter.id === starterId 
				? { ...starter, isFavorite: !starter.isFavorite }
				: starter
		)
		setStarters(updatedStarters)
	}

	const duplicateStarter = (starterId: number): void => {
		const starterToDupe = starters.find((s: Starter) => s.id === starterId)
		if (!starterToDupe) return

		const newId = Math.max(0, ...starters.map((s: Starter) => s.id)) + 1
		const duplicatedStarter: Starter = {
			...starterToDupe,
			id: newId,
			name: `${starterToDupe.name} (Copy)`,
			created: new Date().toISOString().split("T")[0],
			isFavorite: false,
			feedingHistory: [],
			notes: [],
		}
		
		setStarters([...starters, duplicatedStarter])
		scheduleNotification(duplicatedStarter)
	}

	const updateStarterName = (name: string, starterId?: number): void => {
		const targetId = starterId || uiState.activeStarter
		const updatedStarters = starters.map((starter: Starter) => {
			if (starter.id === targetId) {
				return { ...starter, name }
			}
			return starter
		})
		setStarters(updatedStarters)
	}

	const updateFeedingSchedule = (hours: number, starterId?: number): void => {
		const targetId = starterId || uiState.activeStarter
		const updatedStarters = starters.map((starter: Starter) => {
			if (starter.id === targetId) {
				const updatedStarter: Starter = { ...starter, feedingSchedule: hours }
				scheduleNotification(updatedStarter)
				return updatedStarter
			}
			return starter
		})
		setStarters(updatedStarters)
	}

	const updateStarterRecipe = (recipeId: number, starterId?: number): void => {
		const targetId = starterId || uiState.activeStarter
		const recipeToUse = recipes.find((r: Recipe) => r.id === recipeId)
		const updatedStarters = starters.map((starter: Starter) => {
			if (starter.id === targetId) {
				return {
					...starter,
					recipe: recipeId ? recipeToUse || null : null,
				}
			}
			return starter
		})
		setStarters(updatedStarters)
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

	// Notification system
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

	return {
		// State
		starters,
		recipes,
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

		// Core actions
		addFeeding,
		addNote,

		// Edit/Delete actions
		editFeeding,
		deleteFeeding,
		startEditingFeeding,
		cancelEditingFeeding,
		editNote,
		deleteNote,
		startEditingNote,
		cancelEditingNote,

		// Starter management actions
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
	}
}