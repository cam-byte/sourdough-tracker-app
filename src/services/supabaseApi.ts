// services/supabaseApi.ts
import { supabase } from './supabase'
import type { Starter, Feeding, Note, StarterDB, FeedingDB, NoteDB } from '../types'

class SupabaseApiService {
  // Helper function to transform DB starter to app starter
  private transformStarter(dbStarter: StarterDB, feedings: FeedingDB[] = [], notes: NoteDB[] = []): Starter {
    return {
      id: dbStarter.id,
      name: dbStarter.name,
      created: dbStarter.created,
      lastFed: dbStarter.last_fed,
      feedingSchedule: dbStarter.feeding_schedule,
      isFavorite: dbStarter.is_favorite,
      recipe: dbStarter.recipe,
      feedingHistory: feedings.map(f => ({
        id: f.id,
        timestamp: f.timestamp,
        flour: f.flour,
        flourType: f.flour_type,
        water: f.water,
        temp: f.temp,
        note: f.notes
      })),
      notes: notes.map(n => ({
        id: n.id,
        date: n.timestamp,
        text: n.text
      }))
    }
  }

  // Get all starters with their feedings and notes
  async getStarters(): Promise<Starter[]> {
    const { data: starters, error: startersError } = await supabase
      .from('starters')
      .select('*')
      .eq('user_id', 'default')
      .order('created_at', { ascending: false })

    if (startersError) throw startersError

    if (!starters || starters.length === 0) return []

    // Get feedings and notes for all starters
    const starterIds = starters.map(s => s.id)
    
    const { data: feedings, error: feedingsError } = await supabase
      .from('feedings')
      .select('*')
      .in('starter_id', starterIds)
      .order('timestamp', { ascending: false })

    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .in('starter_id', starterIds)
      .order('timestamp', { ascending: false })

    if (feedingsError) throw feedingsError
    if (notesError) throw notesError

    // Transform data
    return starters.map(starter => {
      const starterFeedings = feedings?.filter(f => f.starter_id === starter.id) || []
      const starterNotes = notes?.filter(n => n.starter_id === starter.id) || []
      return this.transformStarter(starter, starterFeedings, starterNotes)
    })
  }

  // Get single starter
  async getStarter(id: number): Promise<Starter> {
    const { data: starter, error: starterError } = await supabase
      .from('starters')
      .select('*')
      .eq('id', id)
      .single()

    if (starterError) throw starterError

    const { data: feedings, error: feedingsError } = await supabase
      .from('feedings')
      .select('*')
      .eq('starter_id', id)
      .order('timestamp', { ascending: false })

    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .eq('starter_id', id)
      .order('timestamp', { ascending: false })

    if (feedingsError) throw feedingsError
    if (notesError) throw notesError

    return this.transformStarter(starter, feedings || [], notes || [])
  }

  // Create new starter
  async createStarter(starterData: {
    name: string
    feedingSchedule?: number
    created?: string
    lastFed?: string
  }): Promise<Starter> {
    const { data, error } = await supabase
      .from('starters')
      .insert({
        name: starterData.name,
        feeding_schedule: starterData.feedingSchedule || 24,
        created: starterData.created || new Date().toISOString().split('T')[0],
        last_fed: starterData.lastFed || new Date().toISOString().split('T')[0],
        user_id: 'default'
      })
      .select()
      .single()

    if (error) throw error

    return this.transformStarter(data)
  }

  // Update starter
  async updateStarter(id: number, updates: Partial<Starter>): Promise<Starter> {
    const dbUpdates: any = {}
    
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.feedingSchedule !== undefined) dbUpdates.feeding_schedule = updates.feedingSchedule
    if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite
    if (updates.recipe !== undefined) dbUpdates.recipe = updates.recipe
    if (updates.lastFed !== undefined) dbUpdates.last_fed = updates.lastFed

    dbUpdates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('starters')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return this.getStarter(id)
  }

  // Delete starter
  async deleteStarter(id: number): Promise<{ message: string }> {
    const { error } = await supabase
      .from('starters')
      .delete()
      .eq('id', id)

    if (error) throw error

    return { message: 'Starter deleted successfully' }
  }

  // Add feeding
  async addFeeding(starterId: number, feedingData: {
    flour: number
    water: number
    notes?: string
    flourType?: string
    temp?: number
  }): Promise<Starter> {
    const { error } = await supabase
      .from('feedings')
      .insert({
        starter_id: starterId,
        flour: feedingData.flour,
        water: feedingData.water,
        notes: feedingData.notes || '',
        flour_type: feedingData.flourType || 'AP',
        temp: feedingData.temp || 75
      })

    if (error) throw error

    // Update last_fed date
    await supabase
      .from('starters')
      .update({ 
        last_fed: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('id', starterId)

    return this.getStarter(starterId)
  }

  // Update feeding
  async updateFeeding(starterId: number, feedingId: number, updates: Partial<Feeding>): Promise<Starter> {
    const dbUpdates: any = {}
    
    if (updates.flour !== undefined) dbUpdates.flour = updates.flour
    if (updates.water !== undefined) dbUpdates.water = updates.water
    if (updates.note !== undefined) dbUpdates.notes = updates.note
    if (updates.flourType !== undefined) dbUpdates.flour_type = updates.flourType
    if (updates.temp !== undefined) dbUpdates.temp = updates.temp

    const { error } = await supabase
      .from('feedings')
      .update(dbUpdates)
      .eq('id', feedingId)
      .eq('starter_id', starterId)

    if (error) throw error

    return this.getStarter(starterId)
  }

  // Delete feeding
  async deleteFeeding(starterId: number, feedingId: number): Promise<Starter> {
    const { error } = await supabase
      .from('feedings')
      .delete()
      .eq('id', feedingId)
      .eq('starter_id', starterId)

    if (error) throw error

    return this.getStarter(starterId)
  }

  // Add note
  async addNote(starterId: number, noteText: string): Promise<Starter> {
    const { error } = await supabase
      .from('notes')
      .insert({
        starter_id: starterId,
        text: noteText
      })

    if (error) throw error

    return this.getStarter(starterId)
  }

  // Update note
  async updateNote(starterId: number, noteId: number, noteText: string): Promise<Starter> {
    const { error } = await supabase
      .from('notes')
      .update({ text: noteText })
      .eq('id', noteId)
      .eq('starter_id', starterId)

    if (error) throw error

    return this.getStarter(starterId)
  }

  // Delete note
  async deleteNote(starterId: number, noteId: number): Promise<Starter> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
      .eq('starter_id', starterId)

    if (error) throw error

    return this.getStarter(starterId)
  }
}

export default new SupabaseApiService()