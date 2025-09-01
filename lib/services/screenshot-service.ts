import { BaseService } from './base-service'
import { aiService } from './ai-service'
import { conversationService } from './conversation-service'
import { userService } from './user-service'
import { createServerSupabaseClient } from '../supabase-server'
import type { 
  AnalyzeImageRequest, 
  AnalyzeImageResponse,
  AnalyzeAndGenerateRequest,
  AnalyzeAndGenerateResponse,
  ScreenshotAnalysis,
  Message,
  AnalysisResult
} from '../../types'

export interface ScreenshotHistoryFilters {
  limit?: number
  status?: 'completed' | 'failed' | 'all'
}

export class ScreenshotService extends BaseService {
  constructor() {
    super('ScreenshotService')
  }

  async analyzeAndExtract(
    request: AnalyzeImageRequest & { userId: string }
  ): Promise<{
    conversation: Message[]
    analysis: AnalysisResult
    success: boolean
    processingTime: number
  }> {
    return this.handleServiceError('analyzeAndExtract', async () => {
      // Check rate limits
      const canProceed = await userService.checkRateLimits(request.userId, 'screenshot')
      if (!canProceed) {
        throw new Error('Daily screenshot analysis limit exceeded')
      }

      const startTime = Date.now()

      // Create initial analysis record
      const analysisRecord = await this.createAnalysis({
        userId: request.userId,
        imageUrl: 'data:image/jpeg;base64,' + request.imageBase64.substring(0, 50) + '...', // Truncated for storage
        extractedConversation: [],
        analysis: {},
        processingStatus: 'processing'
      })

      try {
        // Use AI service to analyze screenshot
        const aiResult = await aiService.analyzeScreenshot(request)
        
        if (!aiResult.success) {
          await this.updateAnalysisStatus(analysisRecord.id, 'failed', aiResult.error)
          throw new Error(aiResult.error || 'Screenshot analysis failed')
        }

        // Perform additional analysis on the extracted conversation
        const analysis = await this.performConversationAnalysis(aiResult.conversation, request.matchName)
        
        const processingTime = Date.now() - startTime

        // Update analysis record with results
        await this.updateAnalysis(analysisRecord.id, {
          extractedConversation: aiResult.conversation,
          analysis,
          processingStatus: 'completed',
          processedAt: new Date()
        })

        // Update user usage stats
        await userService.updateUsageStats(request.userId, 'screenshot')

        return {
          conversation: aiResult.conversation,
          analysis,
          success: true,
          processingTime
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        await this.updateAnalysisStatus(analysisRecord.id, 'failed', errorMessage)
        throw error
      }
    })
  }

  async analyzeAndGenerateReplies(
    request: AnalyzeAndGenerateRequest & { userId: string }
  ): Promise<{
    conversation: Message[]
    replies: string[]
    analysis: AnalysisResult
    success: boolean
    processingTime: number
  }> {
    return this.handleServiceError('analyzeAndGenerateReplies', async () => {
      const startTime = Date.now()

      // First, analyze and extract conversation
      const analysisResult = await this.analyzeAndExtract({
        imageBase64: request.imageBase64,
        matchName: request.matchName,
        userId: request.userId
      })

      if (!analysisResult.success) {
        return {
          conversation: [],
          replies: [],
          analysis: {} as AnalysisResult,
          success: false,
          processingTime: Date.now() - startTime
        }
      }

      // Generate replies based on extracted conversation
      const replies = await conversationService.generateReplies({
        conversation: analysisResult.conversation,
        matchName: request.matchName,
        otherInfo: request.otherInfo,
        tone: request.tone,
        userId: request.userId
      })

      const totalProcessingTime = Date.now() - startTime

      return {
        conversation: analysisResult.conversation,
        replies,
        analysis: analysisResult.analysis,
        success: true,
        processingTime: totalProcessingTime
      }
    })
  }

  async getUserHistory(
    userId: string,
    filters: ScreenshotHistoryFilters = {}
  ): Promise<{
    analyses: ScreenshotAnalysis[]
    total: number
  }> {
    return this.handleServiceError('getUserHistory', async () => {
      const supabase = createServerSupabaseClient()
      
      const { limit = 10, status = 'completed' } = filters

      let query = supabase
        .from('screenshot_analyses')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (status !== 'all') {
        query = query.eq('processing_status', status)
      }

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      return {
        analyses: data || [],
        total: count || 0
      }
    })
  }

  private async performConversationAnalysis(
    conversation: Message[],
    matchName?: string
  ): Promise<AnalysisResult> {
    return this.handleServiceError('performConversationAnalysis', async () => {
      // Analyze conversation quality, tone, and provide recommendations
      const messageCount = conversation.length
      const userMessages = conversation.filter(m => m.sender === 'user')
      const matchMessages = conversation.filter(m => m.sender === 'match')

      // Simple quality scoring based on message balance and length
      let conversationQuality = 5 // Default middle score
      
      if (messageCount === 0) {
        conversationQuality = 1
      } else if (messageCount < 3) {
        conversationQuality = 3
      } else if (userMessages.length > 0 && matchMessages.length > 0) {
        // Balanced conversation gets higher score
        const balance = Math.min(userMessages.length, matchMessages.length) / Math.max(userMessages.length, matchMessages.length)
        conversationQuality = Math.round(5 + (balance * 5))
      }

      // Tone analysis (simplified)
      const allText = conversation.map(m => m.message).join(' ').toLowerCase()
      let detectedTone = 'casual'
      let confidence = 0.6

      if (allText.includes('😂') || allText.includes('haha') || allText.includes('lol')) {
        detectedTone = 'funny'
        confidence = 0.8
      } else if (allText.includes('😍') || allText.includes('😘') || allText.includes('cute')) {
        detectedTone = 'flirty'
        confidence = 0.7
      }

      // Generate suggestions and recommendations
      const suggestedImprovements: string[] = []
      const nextStepRecommendations: string[] = []
      const riskFlags: string[] = []

      if (userMessages.length > matchMessages.length * 2) {
        suggestedImprovements.push('Try to balance the conversation - let them share more')
        riskFlags.push('User sending too many messages without responses')
      }

      if (matchMessages.length > userMessages.length * 2) {
        suggestedImprovements.push('Engage more in the conversation - ask questions')
        nextStepRecommendations.push('Ask an engaging follow-up question')
      }

      if (messageCount > 10) {
        nextStepRecommendations.push('Consider suggesting a phone call or meeting up')
      } else if (messageCount > 5) {
        nextStepRecommendations.push('Share something personal to deepen the connection')
      } else {
        nextStepRecommendations.push('Ask an interesting question to keep the conversation flowing')
      }

      // Check for potential red flags
      const lastUserMessage = userMessages[userMessages.length - 1]?.message.toLowerCase() || ''
      if (lastUserMessage.includes('hey') && lastUserMessage.length < 10) {
        suggestedImprovements.push('Avoid generic greetings - be more creative with openers')
      }

      return {
        conversationQuality: Math.min(10, Math.max(1, conversationQuality)),
        suggestedImprovements,
        toneAnalysis: {
          detectedTone,
          confidence
        },
        nextStepRecommendations,
        riskFlags
      }
    })
  }

  private async createAnalysis(data: {
    userId: string
    imageUrl: string
    extractedConversation: Message[]
    analysis: any
    processingStatus: string
  }): Promise<ScreenshotAnalysis> {
    return this.handleServiceError('createAnalysis', async () => {
      const supabase = createServerSupabaseClient()

      const analysisData = {
        user_id: data.userId,
        image_url: data.imageUrl,
        extracted_conversation: data.extractedConversation,
        analysis: data.analysis,
        processing_status: data.processingStatus,
        created_at: new Date().toISOString()
      }

      const { data: analysis, error } = await supabase
        .from('screenshot_analyses')
        .insert([analysisData])
        .select()
        .single()

      if (error) {
        throw error
      }

      return analysis
    })
  }

  private async updateAnalysis(
    id: string,
    updates: Partial<ScreenshotAnalysis>
  ): Promise<void> {
    return this.handleServiceError('updateAnalysis', async () => {
      const supabase = createServerSupabaseClient()

      const { error } = await supabase
        .from('screenshot_analyses')
        .update(updates)
        .eq('id', id)

      if (error) {
        throw error
      }
    })
  }

  private async updateAnalysisStatus(
    id: string,
    status: string,
    errorMessage?: string
  ): Promise<void> {
    const updates: any = {
      processing_status: status,
      processed_at: new Date().toISOString()
    }

    if (errorMessage) {
      updates.error_message = errorMessage
    }

    await this.updateAnalysis(id, updates)
  }
}

export const screenshotService = new ScreenshotService()