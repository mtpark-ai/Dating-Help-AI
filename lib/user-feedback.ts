import { supabase } from './supabase'

export interface CreateUserFeedbackRequest {
  user_id?: string
  email?: string
  rating: number
  thoughts?: string
  follow_up: boolean
  page_source: string
}

export interface UserFeedback {
  id: string
  user_id?: string
  email?: string
  rating: number
  thoughts?: string
  follow_up: boolean
  page_source: string
  created_at: string
  updated_at: string
}

export class UserFeedbackService {
  static async createFeedback(data: CreateUserFeedbackRequest): Promise<UserFeedback | null> {
    try {
      const { data: feedback, error } = await supabase
        .from('user_feedback')
        .insert([data])
        .select()
        .single()

      if (error) {
        console.error('Error creating feedback:', error)
        return null
      }

      return feedback
    } catch (error) {
      console.error('Unexpected error creating feedback:', error)
      return null
    }
  }

  static async getAllFeedback(): Promise<UserFeedback[]> {
    try {
      const { data: feedback, error } = await supabase
        .from('user_feedback')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching all feedback:', error)
        return []
      }

      return feedback || []
    } catch (error) {
      console.error('Unexpected error fetching all feedback:', error)
      return []
    }
  }

  static async getFeedbackByPageSource(pageSource: string): Promise<UserFeedback[]> {
    try {
      const { data: feedback, error } = await supabase
        .from('user_feedback')
        .select('*')
        .eq('page_source', pageSource)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching feedback:', error)
        return []
      }

      return feedback || []
    } catch (error) {
      console.error('Unexpected error fetching feedback:', error)
      return []
    }
  }

  static async getFeedbackStatsBySource(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('user_feedback')
        .select('page_source')

      if (error) {
        console.error('Error fetching feedback stats:', error)
        return {}
      }

      const stats: Record<string, number> = {}
      data?.forEach(item => {
        stats[item.page_source] = (stats[item.page_source] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error('Unexpected error fetching feedback stats:', error)
      return {}
    }
  }

  static async getFeedbackByRating(rating: number): Promise<UserFeedback[]> {
    try {
      const { data: feedback, error } = await supabase
        .from('user_feedback')
        .select('*')
        .eq('rating', rating)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching feedback by rating:', error)
        return []
      }

      return feedback || []
    } catch (error) {
      console.error('Unexpected error fetching feedback by rating:', error)
      return []
    }
  }

  static async deleteFeedback(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_feedback')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting feedback:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Unexpected error deleting feedback:', error)
      return false
    }
  }
}
