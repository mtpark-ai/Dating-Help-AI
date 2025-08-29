import { supabase } from './supabase'
import { UserQuestion, CreateUserQuestionRequest, UpdateUserQuestionRequest } from '../types'

export class UserQuestionsService {
  // 创建新问题
  static async createQuestion(data: CreateUserQuestionRequest): Promise<UserQuestion | null> {
    try {
      console.log('Attempting to create question with data:', data)
      
      const { data: question, error } = await supabase
        .from('user_questions')
        .insert([data])
        .select()
        .single()

      if (error) {
        console.error('Supabase error creating question:', error)
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        return null
      }

      console.log('Question created successfully:', question)
      return question
    } catch (error) {
      console.error('Unexpected error creating question:', error)
      return null
    }
  }

  // 获取所有问题（管理员用）
  static async getAllQuestions(): Promise<UserQuestion[]> {
    try {
      const { data: questions, error } = await supabase
        .from('user_questions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching questions:', error)
        return []
      }

      return questions || []
    } catch (error) {
      console.error('Error fetching questions:', error)
      return []
    }
  }

  // 根据邮箱获取问题
  static async getQuestionsByEmail(email: string): Promise<UserQuestion[]> {
    try {
      const { data: questions, error } = await supabase
        .from('user_questions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching questions by email:', error)
        return []
      }

      return questions || []
    } catch (error) {
      console.error('Error fetching questions by email:', error)
      return []
    }
  }

  // 根据ID获取问题
  static async getQuestionById(id: string): Promise<UserQuestion | null> {
    try {
      const { data: question, error } = await supabase
        .from('user_questions')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching question by id:', error)
        return null
      }

      return question
    } catch (error) {
      console.error('Error fetching question by id:', error)
      return null
    }
  }

  // 更新问题状态或回复
  static async updateQuestion(id: string, data: UpdateUserQuestionRequest): Promise<UserQuestion | null> {
    try {
      const updateData = {
        ...data,
        admin_updated_at: new Date().toISOString()
      }

      const { data: question, error } = await supabase
        .from('user_questions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating question:', error)
        return null
      }

      return question
    } catch (error) {
      console.error('Error updating question:', error)
      return null
    }
  }

  // 删除问题
  static async deleteQuestion(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_questions')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting question:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting question:', error)
      return false
    }
  }

  // 获取问题统计
  static async getQuestionStats(): Promise<{
    total: number
    pending: number
    in_progress: number
    answered: number
    closed: number
  }> {
    try {
      const { data: questions, error } = await supabase
        .from('user_questions')
        .select('status')

      if (error) {
        console.error('Error fetching question stats:', error)
        return { total: 0, pending: 0, in_progress: 0, answered: 0, closed: 0 }
      }

      const stats = {
        total: questions?.length || 0,
        pending: questions?.filter(q => q.status === 'pending').length || 0,
        in_progress: questions?.filter(q => q.status === 'in_progress').length || 0,
        answered: questions?.filter(q => q.status === 'answered').length || 0,
        closed: questions?.filter(q => q.status === 'closed').length || 0
      }

      return stats
    } catch (error) {
      console.error('Error fetching question stats:', error)
      return { total: 0, pending: 0, in_progress: 0, answered: 0, closed: 0 }
    }
  }
}
