import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, History as HistoryIcon, ChefHat } from 'lucide-react'
import { containerVariants, itemVariants } from '../../utils/motionVariants'
import { getHydrationPercentage } from '../../utils/starterUtils'
import type { Starter, Feeding, Baking } from '../../types'
import FeedingHistory from '../../containers/FeedingHistory/FeedingHistory'
import BakingRecordCard from '../../components/BakingRecordCard'
import api from '../../services/api'

interface HistoryProps {
  starter: Starter
  onBack: () => void
  onRecordFeeding: () => void
  onEditFeeding?: (feedingId: number, updatedFeeding: Partial<Feeding>) => void
  onDeleteFeeding?: (feedingId: number) => void
}

const History: React.FC<HistoryProps> = ({
  starter,
  onBack,
  onRecordFeeding,
  onEditFeeding,
  onDeleteFeeding,
}) => {
  const navigate = useNavigate()

  // Tabs
  const [tab, setTab] = useState<'feeding' | 'baking'>('feeding')

  // Baking history state
  const [bakings, setBakings] = useState<Baking[]>([])
  const [bLoading, setBLoading] = useState<boolean>(true)
  const [bError, setBError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        setBLoading(true)
        setBError(null)
        const data = await api.listBakings(starter.id)
        if (!ignore) setBakings(data ?? [])
      } catch (e) {
        if (!ignore) setBError('Failed to load baking history')
      } finally {
        if (!ignore) setBLoading(false)
      }
    }
    // Only fetch when the Baking tab is shown the first time
    if (tab === 'baking') load()
    return () => {
      ignore = true
    }
  }, [tab, starter.id])

  const goRecordBaking = () => {
    if (starter.recipe?.id) navigate(`/recipes/${starter.recipe.id}/bake`)
    else navigate('/recipes') // prompt user to add/select a recipe
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-8 !mt-8"
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
        <h1 className="text-4xl font-bold text-amber-900">History</h1>
        <p className="text-amber-700">Full history for {starter.name}</p>
      </motion.div>

      {/* Tabs */}
      <motion.div className="flex gap-2 justify-center" variants={itemVariants}>
        <button
          onClick={() => setTab('feeding')}
          className={`px-4 py-2 rounded-xl border transition-colors ${
            tab === 'feeding'
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
          }`}
        >
          Feeding History
        </button>
        <button
          onClick={() => setTab('baking')}
          className={`px-4 py-2 rounded-xl border transition-colors ${
            tab === 'baking'
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
          }`}
        >
          Baking History
        </button>
      </motion.div>

      {/* Tab content */}
      <motion.div className="space-y-6" variants={itemVariants}>
        {tab === 'feeding' ? (
          starter.feedingHistory?.length ? (
            <FeedingHistory
              starter={starter}
              getHydrationPercentage={getHydrationPercentage}
              showAll={true}
              onEditFeeding={onEditFeeding}
              onDeleteFeeding={onDeleteFeeding}
            />
          ) : (
            <div className="bg-white rounded-3xl border-2 border-dashed border-amber-200 p-12 text-center">
              <HistoryIcon className="text-amber-300 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-semibold text-amber-900 mb-2">No feedings recorded</h3>
              <p className="text-amber-700 mb-6">Start tracking your feeding schedule</p>
              <button
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
                onClick={onRecordFeeding}
              >
                Record First Feeding
              </button>
            </div>
          )
        ) : (
          <>
            {bLoading ? (
              <div className="text-amber-700">Loading baking history…</div>
            ) : bError ? (
              <div className="text-red-700">{bError}</div>
            ) : bakings.length === 0 ? (
              <div className="bg-white rounded-3xl border-2 border-dashed border-amber-200 p-12 text-center">
                <ChefHat className="text-amber-300 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-semibold text-amber-900 mb-2">No baking records</h3>
                <p className="text-amber-700 mb-6">Start tracking your baking sessions</p>
                <button
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
                  onClick={goRecordBaking}
                >
                  Record First Bake
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {bakings.map((b, index) => (
                  <BakingRecordCard
                    key={b.id}
                    index={index}
                    baking={{
                      id: b.id,
                      date: b.date,
                      starterId: starter.id,
                      starterName: starter.name,
                      notes: b.notes,
                      result: b.result,
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

export default History
