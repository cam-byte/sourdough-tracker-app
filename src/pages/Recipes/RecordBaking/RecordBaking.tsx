import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { containerVariants, itemVariants } from '../../../utils/motionVariants'
import type { Recipe, Starter, NewBaking } from '../../../types'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Textarea from '../../../components/ui/Textarea'
import Select from '../../../components/ui/Select'

interface RecordBakingProps {
	recipes: Recipe[]
	starters: Starter[]
	onRecordBaking: (recipeId: number, baking: NewBaking) => void
}

const RecordBaking: React.FC<RecordBakingProps> = ({ recipes, starters, onRecordBaking }) => {
	const navigate = useNavigate()
	const { id } = useParams<{ id: string }>()
	
	const recipe = recipes.find(r => r.id === Number(id))
	const [baking, setBaking] = useState<NewBaking>({
		date: new Date().toISOString().split("T")[0],
		starterId: starters[0]?.id || 0,
		notes: '',
		result: '',
	})

	if (!recipe) {
		return <div>Recipe not found</div>
	}

	const starterOptions = starters.map(starter => ({
		value: starter.id,
		label: starter.name,
	}))

	const handleSave = () => {
		onRecordBaking(recipe.id, baking)
		navigate(`/recipes/${recipe.id}`)
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
					onClick={() => navigate(`/recipes/${recipe.id}`)}
					className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-800 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-amber-50"
				>
					<ArrowLeft size={20} />
					Back to Recipe
				</button>
				<h1 className="text-4xl font-bold text-amber-900">Record Baking</h1>
				<p className="text-amber-700">Log your baking session for {recipe.name}</p>
			</motion.div>

			<motion.div className="bg-white rounded-3xl p-8 border border-amber-200 shadow-sm" variants={itemVariants}>
				<div className="space-y-6">
					<Input
						label="Baking Date"
						type="date"
						value={baking.date}
						onChange={(e) => setBaking({ ...baking, date: e.target.value })}
					/>

					<Select
						label="Starter Used"
						value={baking.starterId}
						onChange={(e) => setBaking({ ...baking, starterId: Number(e.target.value) })}
						options={starterOptions}
					/>

					<Input
						label="Result"
						placeholder="How did it turn out? (e.g., Great rise, perfect crust)"
						value={baking.result}
						onChange={(e) => setBaking({ ...baking, result: e.target.value })}
					/>

					<Textarea
						label="Notes"
						rows={6}
						placeholder="Add notes about your baking process, timing, results..."
						value={baking.notes}
						onChange={(e) => setBaking({ ...baking, notes: e.target.value })}
					/>
				</div>
			</motion.div>

			<motion.div className="flex gap-4" variants={itemVariants}>
				<Button
					variant="secondary"
					size="lg"
					className="flex-1"
					onClick={() => navigate(`/recipes/${recipe.id}`)}
				>
					Cancel
				</Button>
				<Button
					variant="primary"
					size="lg"
					className="flex-1"
					onClick={handleSave}
				>
					Save Baking Record
				</Button>
			</motion.div>
		</motion.div>
	)
}

export default RecordBaking