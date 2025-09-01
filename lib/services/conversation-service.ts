import { BaseService } from './base-service'
import { aiService } from './ai-service'
import { userService } from './user-service'
import { createServerSupabaseClient } from '../supabase-server'
import type { 
  Conversation, 
  Message, 
  GenerateReplyRequest, 
  ConversationFilters, 
  PaginatedResult 
} from '../../types'

export interface CreateConversationData {
  userId: string
  messages: Message[]
  context?: any
  tone: string
}

export class ConversationService extends BaseService {
  constructor() {
    super('ConversationService')
  }

  async generateReplies(request: GenerateReplyRequest & { userId: string }): Promise<string[]> {
    return this.handleServiceError('generateReplies', async () => {
      // Check rate limits
      const canProceed = await userService.checkRateLimits(request.userId, 'conversation')
      if (!canProceed) {
        throw new Error('Daily conversation limit exceeded')
      }

      // Generate AI replies
      const replies = await aiService.generateReplies(request)

      // Create conversation record
      await this.createConversation({
        userId: request.userId,
        messages: request.conversation,
        context: {
          matchName: request.matchName,
          otherInfo: request.otherInfo,
          platform: request.context?.platform
        },
        tone: request.tone
      }, replies)

      // Update user usage stats
      await userService.updateUsageStats(request.userId, 'conversation')

      return replies
    })
  }

  async regenerateReply(request: GenerateReplyRequest & { userId: string; currentReply: string }): Promise<string> {
    return this.handleServiceError('regenerateReply', async () => {
      const reply = await aiService.regenerateReply(request)

      // Log the regeneration attempt
      this.log('info', 'Reply regenerated', {
        userId: request.userId,
        originalReply: request.currentReply,
        newReply: reply
      })

      return reply
    })
  }

  async createConversation(
    data: CreateConversationData, 
    generatedReplies?: string[]
  ): Promise<Conversation> {
    return this.handleServiceError('createConversation', async () => {
      const supabase = createServerSupabaseClient()

      const conversationData = {
        user_id: data.userId,
        messages: data.messages,
        context: data.context || {},
        generated_replies: generatedReplies || [],
        tone: data.tone,
        status: 'active' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert([conversationData])
        .select()
        .single()

      if (error) {
        throw error
      }

      return conversation
    })
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    return this.handleServiceError('updateConversation', async () => {
      const supabase = createServerSupabaseClient()

      const { data, error } = await supabase
        .from('conversations')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    })
  }

  async getUserHistory(
    userId: string, 
    filters: ConversationFilters = {}
  ): Promise<PaginatedResult<Conversation>> {
    return this.handleServiceError('getUserHistory', async () => {
      const supabase = createServerSupabaseClient()
      
      const { 
        limit = 10, 
        offset = 0, 
        status = 'active' 
      } = filters

      let query = supabase
        .from('conversations')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (status !== 'all') {
        query = query.eq('status', status)
      }

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      const total = count || 0
      const hasMore = offset + limit < total

      return {
        conversations: data || [],
        total,
        hasMore
      }
    })
  }

  async archiveConversation(conversationId: string, userId: string): Promise<{ success: boolean }> {
    return this.handleServiceError('archiveConversation', async () => {
      const supabase = createServerSupabaseClient()

      const { error } = await supabase
        .from('conversations')
        .update({ 
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
        .eq('user_id', userId) // Ensure user owns the conversation

      if (error) {
        throw error
      }

      return { success: true }
    })
  }

  async getConversationById(id: string, userId: string): Promise<Conversation | null> {
    return this.handleServiceError('getConversationById', async () => {
      const supabase = createServerSupabaseClient()

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw error
      }

      return data
    })
  }

  async markReplyAsSelected(conversationId: string, userId: string, selectedReply: string): Promise<void> {
    return this.handleServiceError('markReplyAsSelected', async () => {
      await this.updateConversation(conversationId, {
        selected_reply: selectedReply
      })

      this.log('info', 'Reply marked as selected', {
        userId,
        conversationId,
        selectedReply
      })
    })
  }
}

export const conversationService = new ConversationService()