import { useState } from 'react'
import type { Starter } from '../types'

interface UseStarterManagementProps {
  starters: Starter[]
  setStarters: (starters: Starter[]) => void
  activeStarter: number | null
  setActiveStarter: (id: number) => void
  onNavigate?: (path: string) => void
}

// Hook for managing starter popup state and handlers
export const useStarterManagement = ({
  starters,
  setStarters,
  activeStarter,
  setActiveStarter,
  onNavigate
}: UseStarterManagementProps) => {
  const [showStarterPopup, setShowStarterPopup] = useState(false)
  
  const onViewAllStarters = () => {
    setShowStarterPopup(true)
  }

  const handleDeleteStarters = (starterIds: number[]) => {
    const updatedStarters = starters.filter(s => !starterIds.includes(s.id))
    setStarters(updatedStarters)
    
    // If active starter was deleted, set new active starter
    if (activeStarter && starterIds.includes(activeStarter)) {
      const newActiveStarter = updatedStarters.length > 0 ? updatedStarters[0].id : null
      if (newActiveStarter) {
        setActiveStarter(newActiveStarter)
      }
    }
    
    console.log('Deleted starters:', starterIds)
  }

  const handleToggleFavorite = (starterId: number) => {
    const updatedStarters = starters.map(starter => 
      starter.id === starterId 
        ? { ...starter, isFavorite: !starter.isFavorite }
        : starter
    )
    setStarters(updatedStarters)
    console.log('Toggled favorite for starter:', starterId)
  }

  const handleEditStarter = (starterId: number) => {
    // Close popup and navigate to edit page or open edit modal
    setShowStarterPopup(false)
    if (onNavigate) {
      onNavigate(`/starters/${starterId}/edit`)
    }
    console.log('Editing starter:', starterId)
  }

  const handleDuplicateStarter = (starterId: number) => {
    const starterToDupe = starters.find(s => s.id === starterId)
    if (!starterToDupe) return

    const newId = Math.max(0, ...starters.map((s) => s.id)) + 1
    const duplicatedStarter: Starter = {
      ...starterToDupe,
      id: newId,
      name: `${starterToDupe.name} (Copy)`,
      created: new Date().toISOString().split("T")[0],
      isFavorite: false,
      feedingHistory: [], // Start fresh feeding history
      notes: [], // Start fresh notes
    }
    
    setStarters([...starters, duplicatedStarter])
    console.log('Duplicated starter:', starterId, 'as new starter:', newId)
  }

  const handleViewRecipe = (recipeId: number) => {
    // Close popup and navigate to recipe page
    setShowStarterPopup(false)
    if (onNavigate) {
      onNavigate(`/recipes/${recipeId}`)
    }
    console.log('Viewing recipe:', recipeId)
  }

  const handleActiveStarterChange = (starterId: number) => {
    setActiveStarter(starterId)
    console.log('Changed active starter to:', starterId)
  }

  const handleAddNewStarter = () => {
    const newId = Math.max(0, ...starters.map((s) => s.id)) + 1
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
    setActiveStarter(newId)
    
    // Close popup after adding
    setShowStarterPopup(false)
    
    console.log('Added new starter:', newId)
  }

  return {
    showStarterPopup,
    setShowStarterPopup,
    onViewAllStarters,
    handleDeleteStarters,
    handleToggleFavorite,
    handleEditStarter,
    handleDuplicateStarter,
    handleViewRecipe,
    handleActiveStarterChange,
    handleAddNewStarter
  }
}

export default useStarterManagement