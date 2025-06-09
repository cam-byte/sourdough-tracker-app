import type { Starter, Feeding } from '../types/index'

export const isOverdue = (starter: Starter): boolean => {
	if (!starter.lastFed || !starter.feedingSchedule) return false

	const lastFed = new Date(starter.lastFed)
	const nextFeeding = new Date(lastFed.getTime() + starter.feedingSchedule * 60 * 60 * 1000)
	return new Date() > nextFeeding
}

export const timeUntilNextFeeding = (starter: Starter): string => {
	if (!starter.lastFed || !starter.feedingSchedule) return "Unknown"

	const lastFed = new Date(starter.lastFed)
	const nextFeeding = new Date(lastFed.getTime() + starter.feedingSchedule * 60 * 60 * 1000)
	const now = new Date()

	const diffMs = nextFeeding.getTime() - now.getTime()
	if (diffMs <= 0) return "Overdue!"

	const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
	const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

	return `${diffHrs}h ${diffMins}m`
}

export const getStarterAge = (starter: Starter): string => {
	if (!starter.created) return "Unknown"

	const created = new Date(starter.created)
	const now = new Date()
	const diffTime = Math.abs(now.getTime() - created.getTime())
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

	return `${diffDays} days`
}

export const getHydrationPercentage = (feeding: Feeding): number => {
	if (!feeding.flour || feeding.flour === 0) return 0
	return Math.round((feeding.water / feeding.flour) * 100)
}