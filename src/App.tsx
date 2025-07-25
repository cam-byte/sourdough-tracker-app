import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useSourdoughTracker } from './hooks/useSourdoughTracker'
import type { Recipe, NewBaking, Starter } from './types'
import "./App.css"
import Dashboard from './pages/Dashboard'
import Feeding from './pages/Feeding'
import Notes from './pages/Notes'
import History from './pages/History'
import RecipeList from './pages/Recipes/RecipeList'
import AddRecipe from './pages/Recipes/AddRecipe'
import RecipeDetail from './pages/Recipes/RecipeDetail'
import RecordBaking from './pages/Recipes/RecordBaking'
import AppLayout from './components/layout/AppLayout'
import { useEffect } from 'react'

// Create a wrapper component that has access to navigate
function AppContent() {
	const navigate = useNavigate()

	const {
		// State
		starters,
		recipes,
		loading,           // ← Add this
		error,             // ← Add this
		newFeeding,
		newNote,
		activeStarter,
		showStarterPopup,
		setRecipes,
		setNewFeeding,
		setNewNote,
		setActiveStarter,
		setActiveRecipe,

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

		// Popup management
		openStarterManagement,
		closeStarterManagement,
		requestNotificationPermission,
		editFeeding,
		deleteFeeding,
		editNote,
		deleteNote,
		clearError,        // ← Add this
	} = useSourdoughTracker()

	const activeStarterData = getActiveStarterData()

	// All hooks must come before any early returns
	useEffect(() => {
		// Request notification permission when app loads
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

	// Add loading state handling AFTER all hooks
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

	// Add error state handling AFTER all hooks
	if (error) {
		return (
			<AppLayout>
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">
						<div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
							<h2 className="text-red-800 font-semibold mb-2">Connection Error</h2>
							<p className="text-red-600 mb-4">{error}</p>
							<div className="space-x-2">
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

	// Recipe management functions
	const addNewRecipe = (recipeData: Omit<Recipe, 'id' | 'bakingHistory'>) => {
		const newId = Math.max(0, ...recipes.map((r) => r.id)) + 1
		const newRecipe: Recipe = {
			id: newId,
			...recipeData,
			bakingHistory: [],
		}
		setRecipes([...recipes, newRecipe])
		setActiveRecipe(newId)
	}

	const deleteRecipe = (id: number) => {
		const updatedRecipes = recipes.filter((recipe) => recipe.id !== id)
		setRecipes(updatedRecipes)
		if (updatedRecipes.length > 0) {
			setActiveRecipe(updatedRecipes[0].id)
		}
	}

	const recordBaking = (recipeId: number, bakingData: NewBaking) => {
		const starterUsed = starters.find((s: Starter) => s.id === bakingData.starterId)
		if (!starterUsed) return

		const bakingRecord = {
			id: Date.now(),
			date: bakingData.date,
			starterId: bakingData.starterId,
			starterName: starterUsed.name,
			notes: bakingData.notes,
			result: bakingData.result,
		}

		const updatedRecipes = recipes.map((recipe) => {
			if (recipe.id === recipeId) {
				return {
					...recipe,
					bakingHistory: [bakingRecord, ...recipe.bakingHistory],
				}
			}
			return recipe
		})

		setRecipes(updatedRecipes)
	}

	// Navigation handlers
	const handleViewRecipeNav = () => {
		if (activeStarterData?.recipe?.id) {
			navigate(`/recipes/${activeStarterData.recipe.id}`)
		}
	}

	const handleAddRecipe = () => {
		navigate('/recipes/add')
	}

	const handleRecordFeeding = () => {
		navigate('/feeding')
	}

	const handleAddNote = () => {
		navigate('/notes')
	}

	const handleViewHistory = () => {
		navigate('/history')
	}

	const handleViewNotes = () => {
		navigate('/notes')
	}

	// Enhanced starter management handlers that actually work
	const handleActiveStarterChange = (starterId: number) => {
		setActiveStarter(starterId)
		console.log('Active starter changed to:', starterId)
	}

	// Update these handlers to handle async operations
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
		// Navigate to edit page or open edit modal
		closeStarterManagement()
		// You can navigate to an edit page if you have one
		// navigate(`/starters/${starterId}/edit`)
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
									recipes={recipes}
									onUpdateStarterName={updateStarterName}
									onUpdateFeedingSchedule={updateFeedingSchedule}
									onUpdateStarterRecipe={updateStarterRecipe}
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
					<Route path="/recipes" element={<RecipeList recipes={recipes} />} />
					<Route
						path="/recipes/add"
						element={<AddRecipe onSaveRecipe={addNewRecipe} />}
					/>
					<Route
						path="/recipes/:id"
						element={
							<RecipeDetail
								recipes={recipes}
								starters={starters}
								onDeleteRecipe={deleteRecipe}
							/>
						}
					/>
					<Route
						path="/recipes/:id/bake"
						element={
							<RecordBaking
								recipes={recipes}
								starters={starters}
								onRecordBaking={recordBaking}
							/>
						}
					/>

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
			<AppContent />
		</Router>
	)
}

export default App