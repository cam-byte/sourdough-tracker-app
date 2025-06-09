import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChefHat, Pencil, Trash2, List } from 'lucide-react'
import { containerVariants, itemVariants } from '../../../utils/motionVariants'
import type { Recipe, Starter } from '../../../types'
import BakingRecordCard from '../../../components/BakingRecordCard'

interface RecipeDetailProps {
	recipes: Recipe[]
	starters: Starter[]
	onDeleteRecipe: (id: number) => void
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipes, onDeleteRecipe }) => {
	const navigate = useNavigate()
	const { id } = useParams<{ id: string }>()
	
	const recipe = recipes.find(r => r.id === Number(id))
	
	if (!recipe) {
		return <div>Recipe not found</div>
	}

	const handleDelete = () => {
		if (window.confirm('Are you sure you want to delete this recipe?')) {
			onDeleteRecipe(recipe.id)
			navigate('/recipes')
		}
	}

	return (
		<motion.div
			className="max-w-4xl mx-auto space-y-8 !mt-8 !p-4"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
		>
			<motion.div className="flex items-center justify-between" variants={itemVariants}>
				<div className="space-y-2">
					<button
						onClick={() => navigate('/recipes')}
						className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-800 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-amber-50"
					>
						<ArrowLeft size={20} />
						Back to Recipes
					</button>
					<h1 className="text-4xl font-bold text-amber-900">{recipe.name}</h1>
				</div>
				<div className="flex gap-3">
					<button
						className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
						onClick={() => navigate(`/recipes/${recipe.id}/bake`)}
					>
						<ChefHat size={20} />
						Record Baking
					</button>
					<button
						className="p-3 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-xl transition-colors"
						onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
					>
						<Pencil size={20} />
					</button>
					<button
						className="p-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors"
						onClick={handleDelete}
					>
						<Trash2 size={20} />
					</button>
				</div>
			</motion.div>

			<motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-8" variants={itemVariants}>
				<div className="bg-white rounded-3xl p-8 border border-amber-200 shadow-sm">
					<div className="flex items-center gap-3 mb-6">
						<List className="text-amber-600" size={24} />
						<h2 className="text-2xl font-semibold text-amber-900">Ingredients</h2>
					</div>
					<div className="bg-amber-50 rounded-2xl p-6">
						<pre className="whitespace-pre-wrap text-amber-800 leading-relaxed">{recipe.ingredients}</pre>
					</div>
				</div>

				<div className="bg-white rounded-3xl p-8 border border-amber-200 shadow-sm">
					<div className="flex items-center gap-3 mb-6">
						<ChefHat className="text-green-600" size={24} />
						<h2 className="text-2xl font-semibold text-amber-900">Instructions</h2>
					</div>
					<div className="bg-amber-50 rounded-2xl p-6">
						<pre className="whitespace-pre-wrap text-amber-800 leading-relaxed">{recipe.instructions}</pre>
					</div>
				</div>
			</motion.div>

			<motion.div className="space-y-6" variants={itemVariants}>
				<h2 className="text-2xl font-semibold text-amber-900">Baking History</h2>

				{recipe.bakingHistory.length === 0 ? (
					<div className="bg-white rounded-3xl border-2 border-dashed border-amber-200 p-12 text-center">
						<ChefHat className="text-amber-300 mx-auto mb-4" size={48} />
						<h3 className="text-xl font-semibold text-amber-900 mb-2">No baking records</h3>
						<p className="text-amber-700 mb-6">Start tracking your baking sessions with this recipe</p>
						<button
							className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
							onClick={() => navigate(`/recipes/${recipe.id}/bake`)}
						>
							Record First Bake
						</button>
					</div>
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<AnimatePresence>
							{recipe.bakingHistory.map((baking, index) => (
								<BakingRecordCard key={baking.id} baking={baking} index={index} />
							))}
						</AnimatePresence>
					</div>
				)}
			</motion.div>
		</motion.div>
	)
}

export default RecipeDetail