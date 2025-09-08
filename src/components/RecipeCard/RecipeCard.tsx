import React from 'react'
import { motion } from 'framer-motion'
import { ChefHat } from 'lucide-react'
import type { Recipe } from '../../types'

interface RecipeCardProps {
  recipe: Recipe
  index?: number
  onClick: () => void
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, index = 0, onClick }) => {
  // Safe fallbacks
  const bakingHistory = recipe.bakingHistory ?? []
  const ingredients = recipe.ingredients ?? ''

  const historyCount = bakingHistory.length
  const ingredientLines = ingredients.split('\n').filter(Boolean)
  const preview = ingredientLines.slice(0, 3).join(', ')
  const hasMore = ingredientLines.length > 3

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold text-amber-900 group-hover:text-amber-700 transition-colors">
          {recipe.name}
        </h3>
        <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs">
          <ChefHat size={12} />
          {historyCount}
        </div>
      </div>

      <div className="text-sm text-amber-700 mb-4 line-clamp-3">
        {preview}
        {hasMore && '...'}
      </div>

      <div className="text-xs text-amber-600">
        {historyCount} baking sessions recorded
      </div>
    </motion.div>
  )
}

export default RecipeCard
