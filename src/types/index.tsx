export interface Feeding {
	id: number
	timestamp: string
	flour: number
	flourType: string
	water: number
	temp: number
	note: string
}

export interface Note {
	id: number
	date: string
	text: string
	created?: string
}

export interface Recipe {
	id: number
	name: string
	ingredients: string
	instructions: string
	bakingHistory: BakingRecord[]
}

export interface BakingRecord {
	id: number
	date: string
	starterId: number
	starterName: string
	notes: string
	result: string
}

export interface Starter {
	id: number
	name: string
	created: string
	lastFed: string
	recipe: Recipe | null
	feedingSchedule: number
	feedingHistory: Feeding[]
	notes: Note[]
	isFavorite?: boolean
}

export interface NewFeeding {
	date: string
	time: string
	flour: number
	flourType: string
	water: number
	temp: number
	note: string
}

export interface NewBaking {
	date: string
	starterId: number
	notes: string
	result: string
}

export type ViewType =
	| "dashboard"
	| "feeding"
	| "notes"
	| "history"
	| "recipes"
	| "addRecipe"
	| "editRecipe"
	| "viewRecipe"
	| "recordBaking"