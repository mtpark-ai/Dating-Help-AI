import { BaseService } from './base-service'
import { aiService } from './ai-service'
import { userService } from './user-service'
import { createServerSupabaseClient } from '../supabase-server'
import type { PickupLineGeneration, PaginatedResult } from '../../types'

export interface GeneratePickupLineRequest {
  userId: string
  prompt: string
  tone: 'flirty' | 'funny' | 'casual' | 'clever'
  category: 'opener' | 'icebreaker' | 'compliment' | 'question' | 'custom'
  count?: number
}

export interface PickupLineHistoryFilters {
  limit?: number
  category?: 'opener' | 'icebreaker' | 'compliment' | 'question' | 'custom' | 'all'
}

export class PickupLineService extends BaseService {
  constructor() {
    super('PickupLineService')
  }

  async generate(request: GeneratePickupLineRequest): Promise<{
    lines: string[]
    category: string
    processingTime: number
  }> {
    return this.handleServiceError('generate', async () => {
      // Check rate limits
      const canProceed = await userService.checkRateLimits(request.userId, 'pickupLine')
      if (!canProceed) {
        throw new Error('Daily pickup line limit exceeded')
      }

      const startTime = Date.now()
      
      // Build specific prompt for pickup lines based on category and tone
      const categoryPrompts = {
        opener: "Create conversation openers that are engaging and make a great first impression",
        icebreaker: "Generate fun and light icebreaker lines that help break the initial conversation barrier",
        compliment: "Write sincere compliments that feel genuine and not overly forward",
        question: "Create interesting questions that encourage meaningful conversation",
        custom: "Generate creative lines based on the specific request"
      }

      const toneAdjustments = {
        flirty: "with a playful, charming, and subtly flirtatious tone",
        funny: "with humor, wit, and clever wordplay that makes people smile",
        casual: "with a relaxed, friendly, and approachable tone",
        clever: "with intelligence, creativity, and unique wordplay"
      }

      const enhancedPrompt = `
# Pickup Line Generation Request

## Context
${categoryPrompts[request.category]} ${toneAdjustments[request.tone]}.

## User Request
"${request.prompt}"

## Instructions
1. Generate ${request.count || 3} high-quality pickup lines
2. Each line should be 5-15 words maximum
3. Tone: ${request.tone}
4. Category: ${request.category}
5. Lines should feel natural and authentic
6. Avoid cliché or overused lines
7. Consider the context provided in the prompt
8. Separate each line with a newline

## Quality Standards
- Respectful and appropriate
- Creative and memorable  
- Likely to get a positive response
- Matches the requested tone perfectly
- Feels genuine, not forced

Generate the pickup lines now:`

      // Use AI service to generate lines
      const aiResponse = await aiService.generateReplies({
        conversation: [{ sender: 'user', message: enhancedPrompt }],
        tone: request.tone
      })

      // Parse and clean up the generated lines
      const lines = aiResponse.flatMap(response => 
        response.split('\n')
          .filter(line => line.trim().length > 0)
          .map(line => line.trim().replace(/^\d+\.\s*/, ''))
      ).slice(0, request.count || 3)

      const processingTime = Date.now() - startTime

      // Store the generation record
      await this.createGeneration({
        userId: request.userId,
        prompt: request.prompt,
        generatedLines: lines,
        tone: request.tone,
        category: request.category,
        metadata: {
          responseTime: processingTime,
          modelVersion: 'chatgpt-4o-latest',
          contentFiltered: false
        }
      })

      // Update user usage stats
      await userService.updateUsageStats(request.userId, 'pickupLine')

      return {
        lines,
        category: request.category,
        processingTime
      }
    })
  }

  async getUserHistory(
    userId: string,
    filters: PickupLineHistoryFilters = {}
  ): Promise<PaginatedResult<PickupLineGeneration>> {
    return this.handleServiceError('getUserHistory', async () => {
      const supabase = createServerSupabaseClient()
      
      const { limit = 10, category = 'all' } = filters

      let query = supabase
        .from('pickup_line_generations')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (category !== 'all') {
        query = query.eq('category', category)
      }

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      return {
        generations: data || [],
        total: count || 0
      }
    })
  }

  async rateGeneration(
    userId: string,
    generationId: string,
    rating: number,
    selectedLine?: string
  ): Promise<{ success: boolean }> {
    return this.handleServiceError('rateGeneration', async () => {
      const supabase = createServerSupabaseClient()

      const updates: any = { rating }
      if (selectedLine) {
        updates.selected_line = selectedLine
      }

      const { error } = await supabase
        .from('pickup_line_generations')
        .update(updates)
        .eq('id', generationId)
        .eq('user_id', userId) // Ensure user owns the generation

      if (error) {
        throw error
      }

      this.log('info', 'Pickup line generation rated', {
        userId,
        generationId,
        rating,
        selectedLine: !!selectedLine
      })

      return { success: true }
    })
  }

  private async createGeneration(data: {
    userId: string
    prompt: string
    generatedLines: string[]
    tone: string
    category: string
    metadata?: any
  }): Promise<PickupLineGeneration> {
    return this.handleServiceError('createGeneration', async () => {
      const supabase = createServerSupabaseClient()

      const generationData = {
        user_id: data.userId,
        prompt: data.prompt,
        generated_lines: data.generatedLines,
        tone: data.tone,
        category: data.category,
        metadata: data.metadata || {},
        created_at: new Date().toISOString()
      }

      const { data: generation, error } = await supabase
        .from('pickup_line_generations')
        .insert([generationData])
        .select()
        .single()

      if (error) {
        throw error
      }

      return generation
    })
  }

  async getGenerationById(id: string, userId: string): Promise<PickupLineGeneration | null> {
    return this.handleServiceError('getGenerationById', async () => {
      const supabase = createServerSupabaseClient()

      const { data, error } = await supabase
        .from('pickup_line_generations')
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
}

export const pickupLineService = new PickupLineService()