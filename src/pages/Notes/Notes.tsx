import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, StickyNote } from 'lucide-react'
import { containerVariants, itemVariants } from '../../utils/motionVariants'
import type { Starter } from '../../types'
import Textarea from '../../components/ui/Textarea'
import Button from '../../components/ui/Button'
import NoteCard from '../../components/NoteCard'

interface NotesProps {
	starter: Starter
	newNote: string
	onUpdateNote: (note: string) => void
	onAddNote: () => void
	onBack: () => void
	onEditNote?: (noteId: number, updatedText: string) => void
	onDeleteNote?: (noteId: number) => void
}

const Notes: React.FC<NotesProps> = ({
	starter,
	newNote,
	onUpdateNote,
	onAddNote,
	onBack,
	onEditNote,
	onDeleteNote,
}) => {
	return (
		<motion.div
			className="max-w-4xl mx-auto space-y-8 !mt-8 !p-4"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
		>
			<motion.div className="text-center space-y-4" variants={itemVariants}>
				<button
					onClick={onBack}
					className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-800 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-amber-50"
				>
					<ArrowLeft size={20} />
					Back to Dashboard
				</button>
				<h1 className="text-4xl font-bold text-amber-900">Notes</h1>
				<p className="text-amber-700">Keep track of your starter's behavior and observations</p>
			</motion.div>

			<motion.div className="bg-white rounded-3xl p-8 border border-amber-200 shadow-sm" variants={itemVariants}>
				<div className="space-y-4">
					<Textarea
						label="Add New Note"
						rows={4}
						placeholder="What did you observe about your starter today?"
						value={newNote}
						onChange={(e) => onUpdateNote(e.target.value)}
					/>
					<div className="flex justify-end">
						<Button
							onClick={onAddNote}
							disabled={!newNote.trim()}
							className="bg-purple-600 hover:bg-purple-700"
						>
							Add Note
						</Button>
					</div>
				</div>
			</motion.div>

			<motion.div className="space-y-6" variants={itemVariants}>
				<h2 className="text-2xl font-semibold text-amber-900">All Notes</h2>

				{starter.notes.length === 0 ? (
					<div className="bg-white rounded-3xl border-2 border-dashed border-amber-200 p-12 text-center">
						<StickyNote className="text-amber-300 mx-auto mb-4" size={48} />
						<h3 className="text-xl font-semibold text-amber-900 mb-2">No notes yet</h3>
						<p className="text-amber-700">Start documenting your starter's journey</p>
					</div>
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<AnimatePresence>
							{starter.notes.map((note, index) => (
								<NoteCard 
									key={note.id} 
									note={note} 
									index={index}
									onEdit={onEditNote}
									onDelete={onDeleteNote}
								/>
							))}
						</AnimatePresence>
					</div>
				)}
			</motion.div>
		</motion.div>
	)
}

export default Notes