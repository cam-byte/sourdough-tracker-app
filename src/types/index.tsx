// types/index.ts

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
	feedingSchedule: number
	feedingHistory: Feeding[]
	notes: Note[]
	recipe: Recipe | null
	isFavorite: boolean
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
  
  // API Response types
  export interface ApiResponse<T> {
	data: T
	success: boolean
	message?: string
  }
  
  export interface ApiError {
	error: string
	status?: number
  }
  
  // Supabase Database Types
  export interface StarterDB {
	id: number
	name: string
	created: string
	last_fed: string
	feeding_schedule: number
	is_favorite: boolean
	recipe: any
	user_id: string
	created_at: string
	updated_at: string
  }
  
  export interface FeedingDB {
	id: number
	starter_id: number
	flour: number
	flour_type: string
	water: number
	temp: number
	notes: string
	timestamp: string
	created_at: string
  }
  
  export interface NoteDB {
	id: number
	starter_id: number
	text: string
	timestamp: string
	created_at: string
  }