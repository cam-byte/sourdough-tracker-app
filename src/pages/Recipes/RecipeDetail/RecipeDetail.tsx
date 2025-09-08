import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChefHat, Pencil, Trash2, List } from 'lucide-react'
import { containerVariants, itemVariants } from '../../../utils/motionVariants'
import type { Recipe, Starter, Baking } from '../../../types'
import BakingRecordCard from '../../../components/BakingRecordCard'
import api from '../../../services/api'

interface RecipeDetailProps {
  recipes: Recipe[]
  starters: Starter[]
  onDeleteRecipe: (id: number) => void
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipes, starters, onDeleteRecipe }) => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const numericId = Number(id)

  // Look up recipe
  const recipe = recipes.find(r => r.id === numericId)

  // Resolve starter id for this recipe (your backend bakings list is by starter)
  const starterForRecipe =
    starters.find(s => s.recipe?.id === numericId) ||
    starters.find(s => s.id === numericId) || // in your setup recipe.id often == starter.id
    undefined
  const starterId = starterForRecipe?.id

  // Remote baking history
  const [bakings, setBakings] = useState<Baking[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    const load = async () => {
      if (!starterId) {
        setBakings([])
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setLoadError(null)
        const data = await api.listBakings(starterId)
        if (!ignore) setBakings(data ?? [])
      } catch (e) {
        if (!ignore) setLoadError('Failed to load baking history')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [starterId])

  if (!recipe) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <button
          onClick={() => navigate('/recipes')}
          className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-800 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-amber-50"
        >
          <ArrowLeft size={18} />
          Back to Recipes
        </button>
        <h1 className="mt-4 text-2xl font-semibold text-amber-900">Recipe not found</h1>
      </div>
    )
  }

  const ingredients = recipe.ingredients ?? ''
  const instructions = recipe.instructions ?? ''

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
      {/* Header */}
      <motion.div className="flex items-center justify-between" variants={itemVariants}>
        <div className="space-y-2">
          <button
            onClick={() => navigate('/recipes')}
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-800 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-amber-50"
          >
            <ArrowLeft size={20} />
            Back to Recipes
          </button>
          <h1 className="text-4xl font-bold text-amber-900">{recipe.name || 'Untitled Recipe'}</h1>
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

      {/* Ingredients / Instructions */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-8" variants={itemVariants}>
        <div className="bg-white rounded-3xl p-8 border border-amber-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <List className="text-amber-600" size={24} />
            <h2 className="text-2xl font-semibold text-amber-900">Ingredients</h2>
          </div>
          <div className="bg-amber-50 rounded-2xl p-6">
            <pre className="whitespace-pre-wrap text-amber-800 leading-relaxed">
              {ingredients || '—'}
            </pre>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-amber-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <ChefHat className="text-green-600" size={24} />
            <h2 className="text-2xl font-semibold text-amber-900">Instructions</h2>
          </div>
          <div className="bg-amber-50 rounded-2xl p-6">
            <pre className="whitespace-pre-wrap text-amber-800 leading-relaxed">
              {instructions || '—'}
            </pre>
          </div>
        </div>
      </motion.div>

      {/* Baking History */}
      <motion.div className="space-y-6" variants={itemVariants}>
        <h2 className="text-2xl font-semibold text-amber-900">Baking History</h2>

        {loading ? (
          <div className="text-amber-700">Loading baking history…</div>
        ) : loadError ? (
          <div className="text-red-700">{loadError}</div>
        ) : bakings.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-amber-200 p-12 text-center">
            <ChefHat className="text-amber-300 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold text-amber-900 mb-2">No baking records</h3>
            <p className="text-amber-700 mb-6">Start tracking your baking sessions with this recipe.</p>
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
              {bakings.map((b, index) => (
                <BakingRecordCard
                  key={b.id}
                  index={index}
                  baking={{
                    id: b.id,
                    date: b.date,
                    starterId: b.starterId,
                    starterName:
                      starters.find(s => s.id === b.starterId)?.name ?? 'Starter',
                    notes: b.notes,
                    result: b.result,
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default RecipeDetail
