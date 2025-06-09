import React from 'react'
import { motion } from 'framer-motion'
import { itemVariants } from '../../../../utils/motionVariants'
import type { NewFeeding } from '../../../../types'
import Input from '../../../../components/ui/Input'
import Textarea from '../../../../components/ui/Textarea'
import Select from '../../../../components/ui/Select'

interface FeedingFormProps {
	newFeeding: NewFeeding
	onUpdateFeeding: (feeding: NewFeeding) => void
}

const FeedingForm: React.FC<FeedingFormProps> = ({ newFeeding, onUpdateFeeding }) => {
	const flourTypeOptions = [
		{ value: "AP", label: "All-Purpose" },
		{ value: "Bread", label: "Bread Flour" },
		{ value: "Whole Wheat", label: "Whole Wheat" },
		{ value: "Rye", label: "Rye" },
		{ value: "Spelt", label: "Spelt" },
		{ value: "Einkorn", label: "Einkorn" },
	]

	return (
		<motion.div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm" variants={itemVariants}>
			<div className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Input
						label="Date"
						type="date"
						value={newFeeding.date}
						onChange={(e) => onUpdateFeeding({ ...newFeeding, date: e.target.value })}
					/>
					<Input
						label="Time"
						type="time"
						value={newFeeding.time}
						onChange={(e) => onUpdateFeeding({ ...newFeeding, time: e.target.value })}
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Input
						label="Flour Amount (g)"
						type="number"
						value={newFeeding.flour}
						onChange={(e) => onUpdateFeeding({ 
							...newFeeding, 
							flour: Number(e.target.value) || 0 
						})}
					/>
					<Select
						label="Flour Type"
						value={newFeeding.flourType}
						onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onUpdateFeeding({
							...newFeeding, 
							flourType: e.target.value 
						})}
						options={flourTypeOptions}
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Input
						label="Water Amount (g)"
						type="number"
						value={newFeeding.water}
						onChange={(e) => onUpdateFeeding({ 
							...newFeeding, 
							water: Number(e.target.value) || 0 
						})}
					/>
					<Input
						label="Temperature (°F)"
						type="number"
						value={newFeeding.temp}
						onChange={(e) => onUpdateFeeding({ 
							...newFeeding, 
							temp: Number(e.target.value) || 0 
						})}
					/>
				</div>

				<Textarea
					label="Notes (Optional)"
					rows={4}
					placeholder="Any observations about your starter's behavior, smell, or appearance..."
					value={newFeeding.note}
					onChange={(e) => onUpdateFeeding({ 
						...newFeeding, 
						note: e.target.value 
					})}
				/>
			</div>
		</motion.div>
	)
}

export default FeedingForm