import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit2, Trash2, Save, X } from 'lucide-react'
import type { Note } from '../../types'

interface NoteCardProps {
	note: Note
	index?: number
	onEdit?: (noteId: number, updatedText: string) => void
	onDelete?: (noteId: number) => void
}

const NoteCard: React.FC<NoteCardProps> = ({ 
	note, 
	index = 0, 
	onEdit, 
	onDelete 
}) => {
	const [isEditing, setIsEditing] = useState(false)
	const [editText, setEditText] = useState(note.text || '')

	const handleSave = () => {
		if (onEdit && editText.trim()) {
			onEdit(note.id, editText.trim())
			setIsEditing(false)
		}
	}

	const handleCancel = () => {
		setEditText(note.text || '')
		setIsEditing(false)
	}

	const handleDelete = () => {
		if (onDelete) {
			onDelete(note.id)
		}
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
			exit={{ opacity: 0, y: -20 }}
			className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm hover:shadow-md transition-shadow group"
		>
			<div className="flex items-center justify-between mb-3">
				<span className="text-sm font-medium text-amber-700">
					{new Date(note.date).toLocaleDateString()}
				</span>
				
				{/* Action buttons - only show if handlers provided */}
				{(onEdit || onDelete) && !isEditing && (
					<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
						{onEdit && (
							<button
								onClick={() => setIsEditing(true)}
								className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
								title="Edit note"
							>
								<Edit2 size={16} />
							</button>
						)}
						{onDelete && (
							<button
								onClick={handleDelete}
								className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
								title="Delete note"
							>
								<Trash2 size={16} />
							</button>
						)}
					</div>
				)}

				{/* Save/Cancel buttons during editing */}
				{isEditing && (
					<div className="flex gap-2">
						<button
							onClick={handleSave}
							className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
							title="Save changes"
						>
							<Save size={16} />
						</button>
						<button
							onClick={handleCancel}
							className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
							title="Cancel editing"
						>
							<X size={16} />
						</button>
					</div>
				)}
			</div>

			{isEditing ? (
				<textarea
					value={editText}
					onChange={(e) => setEditText(e.target.value)}
					className="w-full p-3 border border-amber-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-amber-800 bg-amber-50"
					rows={3}
					autoFocus
				/>
			) : (
				<p className="text-amber-800 leading-relaxed">
					{note.text}
				</p>
			)}
		</motion.div>
	)
}

export default NoteCard