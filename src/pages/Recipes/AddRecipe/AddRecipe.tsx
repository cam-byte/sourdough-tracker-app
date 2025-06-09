import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { containerVariants, itemVariants } from '../../../utils/motionVariants'
import type { Recipe } from '../../../types'
import Input from '../../../components/ui/Input'
import Textarea from '../../../components/ui/Textarea'
import Button from '../../../components/ui/Button'

interface AddRecipeProps {
	onSaveRecipe: (recipe: Omit<Recipe, 'id' | 'bakingHistory'>) => void
}

const AddRecipe: React.FC<AddRecipeProps> = ({ onSaveRecipe }) => {
	const navigate = useNavigate()
	const [recipe, setRecipe] = useState({
		name: '',
		ingredients: '',
		instructions: '',
	})

	const handleSave = () => {
		if (!recipe.name.trim()) return
		
		onSaveRecipe(recipe)
		navigate('/recipes')
	}

	return (
		<motion.div
			className="max-w-2xl mx-auto space-y-8 !mt-8"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
		>
			<motion.div className="text-center space-y-4" variants={itemVariants}>
				<button
					onClick={() => navigate('/recipes')}
					className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-800 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-amber-50"
				>
					<ArrowLeft size={20} />
					Back to Recipes
				</button>
				<h1 className="text-4xl font-bold text-amber-900">Add New Recipe</h1>
				<p className="text-amber-700">Create a new sourdough recipe</p>
			</motion.div>

			<motion.div className="bg-white rounded-3xl p-8 border border-amber-200 shadow-sm" variants={itemVariants}>
				<div className="space-y-6">
					<Input
						label="Recipe Name"
						placeholder="e.g., Classic Country Sourdough"
						value={recipe.name}
						onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
						required
					/>

					<Textarea
						label="Ingredients"
						rows={6}
						placeholder="List your ingredients (one per line)&#10;e.g.,&#10;500g bread flour&#10;350g water&#10;100g active starter&#10;10g salt"
						value={recipe.ingredients}
						onChange={(e) => setRecipe({ ...recipe, ingredients: e.target.value })}
					/>

					<Textarea
						label="Instructions"
						rows={10}
						placeholder="Write your step-by-step baking instructions..."
						value={recipe.instructions}
						onChange={(e) => setRecipe({ ...recipe, instructions: e.target.value })}
					/>
				</div>
			</motion.div>

			<motion.div className="flex gap-4" variants={itemVariants}>
				<Button
					variant="secondary"
					size="lg"
					className="flex-1"
					onClick={() => navigate('/recipes')}
				>
					Cancel
				</Button>
				<Button
					variant="primary"
					size="lg"
					className="flex-1"
					onClick={handleSave}
					disabled={!recipe.name.trim()}
				>
					Save Recipe
				</Button>
			</motion.div>
		</motion.div>
	)
}

export default AddRecipe