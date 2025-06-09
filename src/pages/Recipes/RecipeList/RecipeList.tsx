import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, BookOpen } from 'lucide-react'
import { containerVariants, itemVariants } from '../../../utils/motionVariants'
import type { Recipe } from '../../../types'
import RecipeCard from '../../../components/RecipeCard'
import { useNavigate } from 'react-router-dom'

interface RecipeListProps {
	recipes: Recipe[]
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes }) => {
	const navigate = useNavigate()

	return (
		<motion.div
			className="max-w-6xl mx-auto space-y-8 !mt-8"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
		>
			<motion.div className="flex items-center justify-between" variants={itemVariants}>
				<div className="space-y-2">
					<h1 className="text-4xl font-bold text-amber-900">Recipes</h1>
					<p className="text-amber-700">Manage your sourdough recipes and baking history</p>
				</div>
				<button
					className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
					onClick={() => navigate('/recipes/add')}
				>
					<Plus size={20} />
					Add Recipe
				</button>
			</motion.div>

			<motion.div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" variants={itemVariants}>
				{recipes.length === 0 ? (
					<div className="col-span-full bg-white rounded-3xl border-2 border-dashed border-amber-200 p-12 text-center">
						<BookOpen className="text-amber-300 mx-auto mb-4" size={48} />
						<h3 className="text-xl font-semibold text-amber-900 mb-2">No recipes yet</h3>
						<p className="text-amber-700 mb-6">Create your first sourdough recipe</p>
						<button
							className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
							onClick={() => navigate('/recipes/add')}
						>
							Add First Recipe
						</button>
					</div>
				) : (
					<AnimatePresence>
						{recipes.map((recipe, index) => (
							<RecipeCard
								key={recipe.id}
								recipe={recipe}
								index={index}
								onClick={() => navigate(`/recipes/${recipe.id}`)}
							/>
						))}
					</AnimatePresence>
				)}
			</motion.div>
		</motion.div>
	)
}

export default RecipeList