import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, Filter } from 'lucide-react'
import { containerVariants, itemVariants } from '../../utils/motionVariants'
import { useSourdoughTracker } from '../../hooks/useSourdoughTracker'
import type { Baking, Starter } from '../../types'
import BakingRecordCard from '../../components/BakingRecordCard'

const AllBakingHistory: React.FC = () => {
  const { starters, listAllBakings } = useSourdoughTracker()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bakings, setBakings] = useState<Baking[]>([])
  const [starterFilter, setStarterFilter] = useState<number | 0>(0) // 0 = all
  const [query, setQuery] = useState('')

  useEffect(() => {
    let ignore = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await listAllBakings()
        if (!ignore) setBakings(data ?? [])
      } catch (e) {
        if (!ignore) setError('Failed to load baking history')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [listAllBakings])

  const startersById = useMemo(() => {
    const map = new Map<number, Starter>()
    starters.forEach(s => map.set(s.id, s))
    return map
  }, [starters])

  const filtered = useMemo(() => {
    let rows = bakings
    if (starterFilter) {
      rows = rows.filter(b => b.starterId === starterFilter)
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      rows = rows.filter(b =>
        (b.result || '').toLowerCase().includes(q) ||
        (b.notes || '').toLowerCase().includes(q)
      )
    }
    return rows
  }, [bakings, starterFilter, query])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-amber-700">
        Loading baking history…
      </div>
    )
  }
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-red-700">
        {error}
      </div>
    )
  }

  return (
    <motion.div
      className="max-w-6xl mx-auto space-y-8 !mt-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div className="flex items-center justify-between" variants={itemVariants}>
        <div className="flex items-center gap-3">
          <History className="text-amber-600" size={24} />
          <h1 className="text-4xl font-bold text-amber-900">Baking History</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-xl px-3 py-2">
            <Filter size={16} className="text-amber-600" />
            <select
              className="bg-transparent text-sm text-amber-900 focus:outline-none"
              value={starterFilter}
              onChange={(e) => setStarterFilter(Number(e.target.value))}
            >
              <option value={0}>All starters</option>
              {starters.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search notes or result…"
            className="px-3 py-2 bg-white border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div
          className="bg-white rounded-3xl border-2 border-dashed border-amber-200 p-12 text-center"
          variants={itemVariants}
        >
          <History className="text-amber-300 mx-auto mb-4" size={48} />
          <h3 className="text-xl font-semibold text-amber-900 mb-2">No bakes yet</h3>
          <p className="text-amber-700">Record your first baking from any recipe page.</p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          variants={itemVariants}
        >
          <AnimatePresence>
            {filtered.map((b, index) => (
              <BakingRecordCard
                key={b.id}
                index={index}
                baking={{
                  id: b.id,
                  date: b.date,
                  starterId: b.starterId,
                  starterName: startersById.get(b.starterId)?.name ?? 'Starter',
                  notes: b.notes,
                  result: b.result,
                }}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  )
}

export default AllBakingHistory
