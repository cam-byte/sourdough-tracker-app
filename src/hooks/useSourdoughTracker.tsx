import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import type { Starter, Recipe, NewFeeding, NewBaking, ViewType, Feeding, Note } from '../types'
import { useAuth } from './useAuth'

export const useSourdoughTracker = () => {
  // State for data from MongoDB
  const { user, token, isAuthenticated } = useAuth()
  const [starters, setStarters] = useState<Starter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // UI state (not persisted - resets on refresh)
  const [uiState, setUiState] = useState({
    activeStarter: null as number | null,
    activeRecipe: null as number | null,
    view: 'dashboard' as ViewType,
    showModal: false,
    showStarterPopup: false,
    searchTerm: '',
    dateFilter: { start: '', end: '' },
    selectedStarters: [] as number[],
    editingFeeding: null as Feeding | null,
    editingNote: null as Note | null,
  })

  // Form states (not persisted)
  const [newFeeding, setNewFeeding] = useState<NewFeeding>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    flour: 100,
    flourType: 'AP',
    water: 100,
    temp: 75,
    note: '',
  })

  const [newBaking, setNewBaking] = useState<NewBaking>({
    date: new Date().toISOString().split('T')[0],
    starterId: 0,
    notes: '',
    result: '',
  })

  const [newNote, setNewNote] = useState<string>('')
  const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>({
    name: '',
    ingredients: '',
    instructions: '',
    bakingHistory: [],
  })

  // UI state update helper
  const updateUiState = useCallback((updates: Partial<typeof uiState>) => {
    setUiState(prev => ({ ...prev, ...updates }))
  }, [])

  // Data fetching functions
  const fetchStarters = async () => {
    try {
      if (!api.hasToken()) {
        console.log('No token available, skipping starter fetch')
        return
      }

      setLoading(true)
      setError(null)

      console.log('Fetching starters...')
      const startersData = await api.getAllStarters()
      console.log('Fetched starters:', startersData.length)
      setStarters(startersData)

      if (startersData.length > 0 && !uiState.activeStarter) {
        updateUiState({ activeStarter: startersData[0].id })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch starters'
      setError(errorMessage)
      console.error('Error fetching starters:', err)

      if (errorMessage.includes('Authentication required') || errorMessage.includes('Session expired')) {
        console.log('Authentication error detected, user needs to log in')
      }
    } finally {
      setLoading(false)
    }
  }

  // Initial data load
  const loadData = useCallback(async () => {
    if (!isAuthenticated || !token) {
      console.log('Not authenticated, skipping data load')
      return
    }

    if (!api.hasToken()) {
      console.log('API service missing token, syncing...')
      api.setToken(token)
    }

    try {
      setLoading(true)
      await fetchStarters()
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, token])

  useEffect(() => {
    if (isAuthenticated && token) {
      console.log('User authenticated, loading data...')
      loadData()
    } else if (!isAuthenticated) {
      console.log('User not authenticated, clearing data')
      setStarters([])
      setError(null)
    }
  }, [isAuthenticated, token, loadData])

  // Set active starter when starters load
  useEffect(() => {
    if (starters.length > 0 && !uiState.activeStarter) {
      updateUiState({ activeStarter: starters[0].id })
    }
  }, [starters, uiState.activeStarter, updateUiState])

  // Helper functions
  const getActiveStarterData = (): Starter | undefined => {
    return starters.find((s: Starter) => s.id === uiState.activeStarter) || starters[0]
  }

  const getActiveRecipeData = (): Recipe | undefined => {
    const activeStarter = getActiveStarterData()
    return activeStarter?.recipe || undefined
  }

  // Refresh single starter data
  const refreshStarter = async (starterId: number) => {
    try {
      const updatedStarter = await api.getStarter(starterId)
      setStarters(prev => prev.map(s => (s.id === starterId ? updatedStarter : s)))
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
        flourType: newFeeding.flourType,
        temp: newFeeding.temp,
      }

      await api.addFeeding(uiState.activeStarter, feedingData)
      await refreshStarter(uiState.activeStarter)

      // Reset form
      setNewFeeding({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        flour: 100,
        flourType: 'AP',
        water: 100,
        temp: 75,
        note: '',
      })
      updateUiState({ view: 'dashboard' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add feeding')
      console.error('Error adding feeding:', err)
    }
  }

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

  const startEditingFeeding = (feeding: Feeding): void => {
    updateUiState({ editingFeeding: feeding })
  }

  const cancelEditingFeeding = (): void => {
    updateUiState({ editingFeeding: null })
  }

  // Core note functions
  const addNote = async (): Promise<void> => {
    if (!newNote.trim() || !uiState.activeStarter) return

    try {
      await api.addNote(uiState.activeStarter, newNote)
      await refreshStarter(uiState.activeStarter)
      setNewNote('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note')
      console.error('Error adding note:', err)
    }
  }

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

  const startEditingNote = (note: Note): void => {
    updateUiState({ editingNote: note })
  }

  const cancelEditingNote = (): void => {
    updateUiState({ editingNote: null })
  }

  // Starter management functions
  const addNewStarter = async (): Promise<void> => {
    try {
      const newStarter = await api.createStarter({
        user_id: user ? user.id : 0,
        name: `Starter #${starters.length + 1}`,
        feedingSchedule: 24,
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
      await Promise.all(starterIds.map(id => api.deleteStarter(id)))

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
        feedingSchedule: starterToDupe.feedingSchedule,
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
      setStarters(prev => prev.map(s => (s.id === targetId ? updatedStarter : s)))
      scheduleNotification(updatedStarter)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update feeding schedule')
      console.error('Error updating feeding schedule:', err)
    }
  }

  const updateStarterRecipe = async (recipeData: any, starterId?: number): Promise<void> => {
    const targetId = starterId || uiState.activeStarter
    if (!targetId) return

    try {
      await api.updateRecipe(targetId, recipeData)
      await refreshStarter(targetId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update recipe')
      console.error('Error updating recipe:', err)
    }
  }

  // Active starter recipe helpers
  const getActiveStarterRecipe = (): Recipe | null => {
    const activeStarter = getActiveStarterData()
    return activeStarter?.recipe || null
  }

  // Clear the associated recipe for a starter (not the starter itself)
  const clearStarterRecipe = async (starterId?: number): Promise<void> => {
    const targetId = starterId || uiState.activeStarter
    if (!targetId) return

    // If there’s no recipe on this starter, do nothing
    const starter = starters.find(s => s.id === targetId)
    if (!starter?.recipe) return

    try {
      await api.deleteRecipe(targetId)

      // Optimistic update with proper typing: recipe must be null, not undefined
      setStarters(prev =>
        prev.map(s => (s.id === targetId ? { ...s, recipe: null } as Starter : s))
      )

      // Optional strict refresh:
      // await refreshStarter(targetId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recipe')
      console.error('Error deleting recipe:', err)
    }
  }

  // Popup management
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
          navigator.serviceWorker.ready.then(registration => {
            const notificationOptions: NotificationOptions = {
              body: 'Your sourdough starter is ready for feeding',
              icon: '/icon-192.png',
              badge: '/icon-192.png',
              tag: `feeding-${starter.id}`,
              requireInteraction: true,
              ...(('actions' in Notification.prototype) && {
                actions: [
                  { action: 'feed-now', title: 'Feed Now' },
                  { action: 'snooze', title: 'Remind Later' },
                ],
              }),
            }

            registration.showNotification(`Time to feed ${starter.name}!`, notificationOptions)
          })
        }, delay)

        return timeoutId
      }
    }
  }, [])

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }, [])

  useEffect(() => {
    starters.forEach((starter: Starter) => scheduleNotification(starter))
  }, [starters, scheduleNotification])

  // Recipe navigation
  const handleViewRecipe = (recipeId: number, onNavigate?: (path: string) => void) => {
    updateUiState({ activeRecipe: recipeId })
    if (onNavigate) {
      onNavigate(`/recipes/${recipeId}`)
    }
  }

  const listAllBakings = async () => {
    try {
      return await api.listAllBakings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bakings')
      console.error('Error loading bakings:', err)
      return []
    }
  }

  // Clear any errors
  const clearError = () => setError(null)

  return {
    // State
    starters,
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

    // Setters
    setStarters,
    setNewFeeding,
    setNewBaking,
    setNewNote,
    setNewRecipe,
    updateUiState,

    // Individual setters
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

    getActiveStarterRecipe,
    clearStarterRecipe,

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

    // Starter management
    addNewStarter,
    deleteStarters,
    toggleFavorite,
    duplicateStarter,
    updateStarterName,
    updateFeedingSchedule,
    updateStarterRecipe,

    listAllBakings,

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
