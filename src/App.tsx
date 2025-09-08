import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useSourdoughTracker } from './hooks/useSourdoughTracker'
import { AuthContext, useAuthProvider, useAuth } from './hooks/useAuth'
import type { Recipe, NewBaking, Starter } from './types'
import './App.css'
import Dashboard from './pages/Dashboard'
import Feeding from './pages/Feeding'
import Notes from './pages/Notes'
import History from './pages/History'
import RecipeList from './pages/Recipes/RecipeList'
import AddRecipe from './pages/Recipes/AddRecipe'
import RecipeDetail from './pages/Recipes/RecipeDetail'
import RecordBaking from './pages/Recipes/RecordBaking'
import Login from './pages/Login/Login'
import AppLayout from './components/layout/AppLayout'
import apiService from './services/api'
import AllBakingHistory from './pages/Bakings/AllBakingHistory'

// AuthProvider component
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthProvider()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

// Create a wrapper component that has access to navigate and auth
function AppContent() {
  const navigate = useNavigate()
  const { user, login, register, loading: authLoading, error: authError } = useAuth()

  const [recipeLibrary, setRecipeLibrary] = useState<Recipe[]>([])

  const {
    // State
    starters,
    loading,
    error,
    newFeeding,
    newNote,
    activeStarter,
    showStarterPopup,
    setNewFeeding,
    setNewNote,
    setActiveStarter,

    // Helper functions
    getActiveStarterData,

    // Core actions
    addFeeding,
    addNote,

    // Enhanced starter management actions
    addNewStarter,
    deleteStarters,
    toggleFavorite,
    duplicateStarter,
    updateStarterName,
    updateFeedingSchedule,
    updateStarterRecipe,
    clearStarterRecipe, // ← use the new clearer name

    // Popup management
    openStarterManagement,
    closeStarterManagement,
    requestNotificationPermission,
    editFeeding,
    deleteFeeding,
    editNote,
    deleteNote,
    clearError,
  } = useSourdoughTracker()

  const activeStarterData = getActiveStarterData()

  useEffect(() => {
    const setupNotifications = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        const granted = await requestNotificationPermission()
        if (granted) {
          console.log('Notification permission granted')
        }
      }
    }
    setupNotifications()
  }, [requestNotificationPermission])

  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        const data = await apiService.getAllRecipes()
        if (!ignore) setRecipeLibrary(data ?? [])
      } catch (e) {
        console.error('Failed to load recipes:', e)
        // Non-fatal: UI can still work without global recipes list
      }
    }
    if (user) load()
    return () => { ignore = true }
  }, [user])

  if (!user) {
    return <Login onLogin={login} onRegister={register} loading={authLoading} error={authError} />
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-amber-600">Loading your sourdough data...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h2 className="text-red-800 font-semibold mb-2">Connection Error</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="flex gap-2 space-x-2">
                <button
                  onClick={clearError}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Recipe helpers: derive recipes from starters
  const refreshRecipes = async () => {
    try {
      const data = await apiService.getAllRecipes()
      setRecipeLibrary(data ?? [])
    } catch (e) {
      console.error('Failed to refresh recipes:', e)
    }
  }

  // When you add or update a recipe on a starter, also refresh library
  const addNewRecipe = async (recipeData: Omit<Recipe, 'id' | 'bakingHistory'>) => {
    if (!activeStarter) return
    try {
      await updateStarterRecipe(recipeData, activeStarter)
      await refreshRecipes()
      navigate('/dashboard')
    } catch (err) {
      console.error('Failed to add recipe:', err)
    }
  }

  const handleUpdateStarterRecipeSelection = async (selectedRecipeId: number) => {
    if (!activeStarter) return
    try {
      if (selectedRecipeId === 0) {
        await clearStarterRecipe(activeStarter)
        // Important: do not remove anything from recipeLibrary here
        return
      }
      const selected =
        recipeLibrary.find(r => r.id === selectedRecipeId)
      if (!selected) {
        console.warn('Selected recipe not found:', selectedRecipeId)
        return
      }
      await updateStarterRecipe(selected, activeStarter)
      // Make sure library is fresh (if backend mutated data)
      await refreshRecipes()
    } catch (err) {
      console.error('Error updating starter recipe selection:', err)
    }
  }
  // Delete recipe for a given starter (used on RecipeDetail)
  const deleteRecipeForStarter = async (starterId: number) => {
    try {
      await apiService.deleteRecipe(starterId)
      navigate('/recipes')
    } catch (err) {
      console.error('Failed to delete recipe:', err)
    }
  }

  // Record a baking for the starter's recipe
  const recordBaking = async (recipeId: number, bakingData: NewBaking) => {
    const starter = starters.find((s: Starter) => s.id === bakingData.starterId)
    if (!starter || !starter.recipe) return
    if (starter.recipe.id !== recipeId) return

    const bakingRecord = {
      id: Date.now(),
      date: bakingData.date,
      starterId: bakingData.starterId,
      starterName: starter.name,
      notes: bakingData.notes,
      result: bakingData.result,
    }

    const updatedRecipe: Recipe = {
      ...starter.recipe,
      bakingHistory: [bakingRecord, ...(starter.recipe.bakingHistory ?? [])],
    }

    try {
      await updateStarterRecipe(updatedRecipe, starter.id)
      await refreshRecipes()
      navigate(`/recipes/${recipeId}`)
    } catch (err) {
      console.error('Failed to record baking:', err)
    }
  }

  // Navigation handlers
  const handleViewRecipeNav = () => {
    if (activeStarterData?.recipe?.id) {
      navigate(`/recipes/${activeStarterData.recipe.id}`)
    }
  }

  const handleAddRecipe = () => navigate('/recipes/add')
  const handleRecordFeeding = () => navigate('/feeding')
  const handleAddNote = () => navigate('/notes')
  const handleViewHistory = () => navigate('/history')
  const handleViewNotes = () => navigate('/notes')

  const handleActiveStarterChange = (starterId: number) => {
    setActiveStarter(starterId)
    console.log('Active starter changed to:', starterId)
  }

  const handleAddNewStarter = async () => {
    try {
      await addNewStarter()
      console.log('New starter added')
    } catch (err) {
      console.error('Failed to add new starter:', err)
    }
  }

  const handleDeleteStarters = async (starterIds: number[]) => {
    try {
      await deleteStarters(starterIds)
      console.log('Deleted starters:', starterIds)
    } catch (err) {
      console.error('Failed to delete starters:', err)
    }
  }

  const handleToggleFavorite = async (starterId: number) => {
    try {
      await toggleFavorite(starterId)
      console.log('Toggled favorite for starter:', starterId)
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
    }
  }

  const handleEditStarter = (starterId: number) => {
    closeStarterManagement()
    console.log('Editing starter:', starterId)
  }

  const handleDuplicateStarter = async (starterId: number) => {
    try {
      await duplicateStarter(starterId)
      console.log('Duplicated starter:', starterId)
    } catch (err) {
      console.error('Failed to duplicate starter:', err)
    }
  }

  const handleViewRecipeFromPopup = (recipeId: number) => {
    closeStarterManagement()
    navigate(`/recipes/${recipeId}`)
    console.log('Viewing recipe:', recipeId)
  }

  return (
    <AppLayout
      starters={starters}
      activeStarter={activeStarter}
      onActiveStarterChange={handleActiveStarterChange}
      onAddNewStarter={handleAddNewStarter}
      onViewAllStarters={openStarterManagement}
      onDeleteStarters={handleDeleteStarters}
      onToggleFavorite={handleToggleFavorite}
      onEditStarter={handleEditStarter}
      onDuplicateStarter={handleDuplicateStarter}
      onViewRecipe={handleViewRecipeFromPopup}
      showStarterManagement={showStarterPopup}
      onCloseStarterManagement={closeStarterManagement}
    >
      <AnimatePresence mode="wait">
        <Routes>
          {/* Starter Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              activeStarterData ? (
                <Dashboard
                  starter={activeStarterData}
                  recipes={recipeLibrary}
                  onUpdateStarterName={updateStarterName}
                  onUpdateFeedingSchedule={updateFeedingSchedule}
                  onViewRecipe={handleViewRecipeNav}
                  onAddRecipe={handleAddRecipe}
                  onRecordFeeding={handleRecordFeeding}
                  onAddNote={handleAddNote}
                  onViewHistory={handleViewHistory}
                  onViewNotes={handleViewNotes}
                  onEditFeeding={editFeeding}
                  onDeleteFeeding={deleteFeeding}
                  onEditNote={editNote}
                  onDeleteNote={deleteNote}
                  onDeleteStarter={() =>
                    deleteStarters([starters.find(s => s.id === activeStarterData.id)?.id || 0])
                  }
                  onUpdateStarterRecipe={handleUpdateStarterRecipeSelection}
                />
              ) : (
                <div className="flex flex-col items-center justify-center min-h-screen">
                  <div className="text-center">
                    <p className="text-amber-600 mb-4">No starters found.</p>
                    <button
                      onClick={handleAddNewStarter}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                    >
                      Create Your First Starter
                    </button>
                  </div>
                </div>
              )
            }
          />

          <Route
            path="/feeding"
            element={
              <Feeding
                newFeeding={newFeeding}
                onUpdateFeeding={setNewFeeding}
                onSaveFeeding={addFeeding}
                onCancel={() => navigate('/dashboard')}
              />
            }
          />

          <Route
            path="/notes"
            element={
              activeStarterData ? (
                <Notes
                  starter={activeStarterData}
                  newNote={newNote}
                  onUpdateNote={setNewNote}
                  onAddNote={addNote}
                  onEditNote={editNote}
                  onDeleteNote={deleteNote}
                  onBack={() => navigate('/dashboard')}
                />
              ) : (
                <div className="flex flex-col items-center justify-center min-h-screen">
                  <div className="text-center py-8">
                    <p className="text-amber-600 mb-4">No starter selected.</p>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              )
            }
          />

          <Route
            path="/history"
            element={
              activeStarterData ? (
                <History
                  starter={activeStarterData}
                  onBack={() => navigate('/dashboard')}
                  onRecordFeeding={() => navigate('/feeding')}
                  onEditFeeding={editFeeding}
                  onDeleteFeeding={deleteFeeding}
                />
              ) : (
                <div className="flex flex-col items-center justify-center min-h-screen">
                  <div className="text-center py-8">
                    <p className="text-amber-600 mb-4">No starter selected.</p>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              )
            }
          />

          {/* Recipe Routes */}
          <Route path="/recipes" element={<RecipeList recipes={recipeLibrary} />} />

          <Route
            path="/recipes/add"
            element={<AddRecipe onSaveRecipe={addNewRecipe} activeStarterId={activeStarter} />}
          />

          <Route
            path="/recipes/:id"
            element={
              <RecipeDetail
                recipes={recipeLibrary}
                starters={starters}
                onDeleteRecipe={deleteRecipeForStarter}
              />
            }
          />

          <Route
            path="/recipes/:id/bake"
            element={
              <RecordBaking
                recipes={recipeLibrary}
                starters={starters}
                onRecordBaking={recordBaking}
              />
            }
          />

        <Route path="/bakings" element={<AllBakingHistory />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AnimatePresence>
    </AppLayout>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
