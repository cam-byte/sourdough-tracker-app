import type React from "react"
import { motion } from "framer-motion"
import {
    Droplet,
    StickyNote,
    ScrollText,
    CalendarDays,
    Clock,
    History,
    Plus,
    Minus,
    Star,
    TrendingUp,
    Activity,
} from "lucide-react"
import type { Feeding, Recipe, Starter } from "../../types"
import FeedingCard from "../../components/FeedingCard"
import NoteCard from "../../components/NoteCard"

interface DashboardProps {
    starter: Starter
    recipes: Recipe[]

    onUpdateStarterName: (name: string) => void
    onUpdateFeedingSchedule: (hours: number) => void
    onUpdateStarterRecipe: (recipeId: number) => void
    onViewRecipe: () => void
    onAddRecipe: () => void
    onRecordFeeding: () => void
    onAddNote: () => void
    onViewHistory: () => void
    onViewNotes: () => void
    
    // Add edit/delete functionality
    onEditFeeding?: (feedingId: number, updatedFeeding: Partial<Feeding>) => void
    onDeleteFeeding?: (feedingId: number) => void
    onEditNote?: (noteId: number, updatedText: string) => void
    onDeleteNote?: (noteId: number) => void
}

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
}

// Utility functions
const getStarterAge = (starter: Starter): string => {
    // Check if createdAt exists and is valid
    if (!starter.created) return "Unknown"

    const created = new Date(starter.created)

    // Check if the date is valid
    if (isNaN(created.getTime())) return "Unknown"

    const now = new Date()
    const diffTime = Math.abs(now.getTime() - created.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1 day"
    if (diffDays < 30) return `${diffDays} days`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`
    return `${Math.floor(diffDays / 365)} years`
}

const timeUntilNextFeeding = (starter: Starter): string => {
    if (!starter.lastFed) return "Never fed"

    const lastFed = new Date(starter.lastFed)
    const nextFeeding = new Date(lastFed.getTime() + starter.feedingSchedule * 60 * 60 * 1000)
    const now = new Date()

    if (now > nextFeeding) return "Overdue!"

    const diffMs = nextFeeding.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 0) return `${diffHours}h ${diffMinutes}m`
    return `${diffMinutes}m`
}

const getHydrationPercentage = (feeding: Feeding): number => {
    return Math.round((feeding.water / feeding.flour) * 100)
}

const Dashboard: React.FC<DashboardProps> = ({
    starter,
    recipes,
    onUpdateStarterName,
    onUpdateFeedingSchedule,
    onUpdateStarterRecipe,
    onViewRecipe,
    onAddRecipe,
    onRecordFeeding,
    onAddNote,
    onViewHistory,
    onViewNotes,
    onEditFeeding,
    onDeleteFeeding,
    onEditNote,
    onDeleteNote,
}) => {
    const timeLeft = timeUntilNextFeeding(starter)
    const isOverdue = timeLeft === "Overdue!"

    return (
        <motion.div className="space-y-8 p-6" variants={containerVariants} initial="hidden" animate="visible">
            {/* Hero Section */}
            <motion.div className="text-center space-y-6" variants={itemVariants}>
                <div className="relative inline-block">
                    <input
                        type="text"
                        value={starter.name}
                        onChange={(e) => onUpdateStarterName(e.target.value)}
                        className="text-4xl md:text-5xl font-bold bg-transparent border-none focus:outline-none text-center text-amber-900 hover:bg-amber-50 rounded-xl px-4 py-2 transition-colors"
                    />
                    {starter.isFavorite && <Star className="absolute -top-2 -right-2 text-yellow-500 fill-current" size={24} />}
                </div>
                <div className="flex items-center justify-center gap-6 text-amber-700">
                    <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl">
                        <CalendarDays size={18} />
                        <span className="font-medium">Age: {getStarterAge(starter)}</span>
                    </div>
                    <div className="w-3 h-1 bg-amber-300"></div>
                    <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl">
                        <Clock size={18} />
                        <span className="font-medium">Every {starter.feedingSchedule}h</span>
                    </div>
                </div>
            </motion.div>

            {/* Status Cards */}
            <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6" variants={itemVariants}>
                {/* Next Feeding Card */}
                <div
                    className={`relative rounded-2xl p-6 shadow-lg border-4 ${isOverdue ? "bg-red-50 border-red-400 shadow-red-100" : "bg-amber-50 border-amber-400 shadow-amber-100"
                        }`}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${isOverdue ? "bg-red-500" : "bg-amber-500"
                                }`}
                        >
                            <Clock size={24} className="text-white" />
                        </div>
                        <h3 className={`text-xl font-semibold ${isOverdue ? "text-red-900" : "text-amber-900"}`}>Next Feeding</h3>
                    </div>
                    <p className={`text-3xl font-bold mb-2 ${isOverdue ? "text-red-800" : "text-amber-800"}`}>{timeLeft}</p>
                    <p className={`${isOverdue ? "text-red-700" : "text-amber-700"}`}>
                        Last fed: {new Date(starter.lastFed).toLocaleDateString()}
                    </p>

                    {/* Decorative pattern */}
                    <div className="absolute top-4 right-4 grid grid-cols-3 gap-1">
                        {[...Array(9)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${isOverdue ? "bg-red-300" : "bg-amber-300"
                                    } ${i % 2 === 0 ? "opacity-100" : "opacity-50"}`}
                            />
                        ))}
                    </div>

                    {isOverdue && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white" />
                    )}
                </div>

                {/* Feeding Schedule Card */}
                <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <History className="text-amber-600" size={24} />
                        <h3 className="text-xl font-semibold text-amber-900">Schedule</h3>
                    </div>
                    <div className="flex items-center justify-between">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="w-12 h-12 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-700 flex items-center justify-center transition-colors"
                            onClick={() => onUpdateFeedingSchedule(Math.max(1, starter.feedingSchedule - 1))}
                        >
                            <Minus size={20} />
                        </motion.button>
                        <span className="text-3xl font-bold text-amber-900">{starter.feedingSchedule}h</span>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="w-12 h-12 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-700 flex items-center justify-center transition-colors"
                            onClick={() => onUpdateFeedingSchedule(starter.feedingSchedule + 1)}
                        >
                            <Plus size={20} />
                        </motion.button>
                    </div>
                </div>

                {/* Stats Card */}
                <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="text-amber-600" size={24} />
                        <h3 className="text-xl font-semibold text-amber-900">Stats</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-amber-700">Total Feedings</span>
                            <span className="font-semibold text-amber-900">{starter.feedingHistory.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-amber-700">Notes</span>
                            <span className="font-semibold text-amber-900">{starter.notes.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-amber-700">Health</span>
                            <span className="font-semibold text-green-600">Excellent</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Recipe Section */}
            <motion.div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm" variants={itemVariants}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <ScrollText className="text-amber-600" size={24} />
                        <h3 className="text-2xl font-semibold text-amber-900">Associated Recipe</h3>
                    </div>
                    <select
                        value={starter.recipe?.id || 0}
                        onChange={(e) => onUpdateStarterRecipe(Number(e.target.value))}
                        className="px-4 py-2 border border-amber-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50"
                    >
                        <option value={0}>None</option>
                        {recipes.map((recipe) => (
                            <option key={recipe.id} value={recipe.id}>
                                {recipe.name}
                            </option>
                        ))}
                    </select>
                </div>

                {starter.recipe ? (
                    <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-amber-900 text-lg">{starter.recipe.name}</h4>
                                <p className="text-amber-700 mt-1">Recipe linked to this starter</p>
                            </div>
                            <button
                                onClick={onViewRecipe}
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-medium transition-colors"
                            >
                                View Recipe
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-amber-50 rounded-xl p-6 text-center border border-amber-100">
                        <p className="text-amber-700 mb-4">No recipe associated with this starter</p>
                        <button
                            onClick={onAddRecipe}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-medium transition-colors"
                        >
                            Add New Recipe
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={itemVariants}>
                <motion.button
                    className="group relative bg-white border-4 border-amber-400 rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-200 hover:border-amber-500"
                    onClick={onRecordFeeding}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <Droplet size={28} className="text-white" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-xl font-semibold text-amber-900">Record Feeding</h3>
                            <p className="text-amber-700">Log a new feeding session</p>
                        </div>
                    </div>

                    {/* Decorative corner pattern */}
                    <div className="absolute top-4 right-4 flex gap-1">
                        <div className="w-3 h-3 bg-amber-300 rounded-full"></div>
                        <div className="w-2 h-2 bg-amber-400 rounded-full mt-0.5"></div>
                        <div className="w-1 h-1 bg-amber-500 rounded-full mt-1"></div>
                    </div>

                    {/* Bottom decorative line */}
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-amber-400 rounded-b-xl"></div>
                </motion.button>

                <motion.button
                    className="group relative bg-white border-4 border-purple-400 rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-200 hover:border-purple-500"
                    onClick={onAddNote}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <StickyNote size={28} className="text-white" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-xl font-semibold text-purple-900">Add Note</h3>
                            <p className="text-purple-700">Record observations</p>
                        </div>
                    </div>

                    {/* Decorative corner pattern */}
                    <div className="absolute top-4 right-4 flex gap-1">
                        <div className="w-3 h-3 bg-purple-300 rounded-full"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-0.5"></div>
                        <div className="w-1 h-1 bg-purple-500 rounded-full mt-1"></div>
                    </div>

                    {/* Bottom decorative line */}
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-purple-400 rounded-b-xl"></div>
                </motion.button>
            </motion.div>

            {/* Recent Activity */}
            <motion.div className="space-y-8" variants={itemVariants}>
                {/* Recent Feedings */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Activity className="text-amber-600" size={24} />
                            <h3 className="text-2xl font-semibold text-amber-900">Recent Feedings</h3>
                        </div>
                        {starter.feedingHistory.length > 3 && (
                            <button
                                onClick={onViewHistory}
                                className="text-amber-600 hover:text-amber-700 font-medium px-4 py-2 rounded-xl hover:bg-amber-50 transition-colors"
                            >
                                View All
                            </button>
                        )}
                    </div>

                    {starter.feedingHistory.length === 0 ? (
                        <div className="bg-white rounded-2xl border-2 border-dashed border-amber-200 p-12 text-center">
                            <Droplet className="text-amber-300 mx-auto mb-4" size={48} />
                            <h4 className="text-xl font-semibold text-amber-900 mb-2">No feedings yet</h4>
                            <p className="text-amber-700 mb-6">Start tracking your starter's feeding schedule</p>
                            <button
                                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors"
                                onClick={onRecordFeeding}
                            >
                                Record First Feeding
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {starter.feedingHistory.slice(0, 3).map((feeding, index) => (
                                <FeedingCard
                                    key={feeding.id}
                                    feeding={feeding}
                                    index={index}
                                    getHydrationPercentage={getHydrationPercentage}
                                    onEdit={onEditFeeding}
                                    onDelete={onDeleteFeeding}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Notes */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <StickyNote className="text-amber-600" size={24} />
                            <h3 className="text-2xl font-semibold text-amber-900">Recent Notes</h3>
                        </div>
                        {starter.notes.length > 2 && (
                            <button
                                onClick={onViewNotes}
                                className="text-amber-600 hover:text-amber-700 font-medium px-4 py-2 rounded-xl hover:bg-amber-50 transition-colors"
                            >
                                View All
                            </button>
                        )}
                    </div>

                    {starter.notes.length === 0 ? (
                        <div className="bg-white rounded-2xl border-2 border-dashed border-amber-200 p-12 text-center">
                            <StickyNote className="text-amber-300 mx-auto mb-4" size={48} />
                            <h4 className="text-xl font-semibold text-amber-900 mb-2">No notes yet</h4>
                            <p className="text-amber-700 mb-6">Keep track of your starter's behavior and observations</p>
                            <button
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
                                onClick={onAddNote}
                            >
                                Add First Note
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {starter.notes.slice(0, 2).map((note, index) => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    index={index}
                                    onEdit={onEditNote}
                                    onDelete={onDeleteNote}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    )
}

export default Dashboard