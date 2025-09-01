import { NextRequest, NextResponse } from 'next/server'
import { conversationService } from '@/lib/services/conversation-service'
import { handleApiError, wrapAsyncHandler, validateRequest, ValidationError } from '@/lib/error-handler'
import { logger } from '@/lib/logger'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { GenerateReplyRequest, RegenerateReplyRequest } from '@/types'

export const POST = wrapAsyncHandler(async (request: NextRequest) => {
  const url = new URL(request.url)
  const action = url.searchParams.get('action')
  
  // Get user from session
  const supabase = createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  logger.businessEvent('conversation_request_started', { action, userId: user.id })
  
  if (action === 'regenerate') {
    const body: RegenerateReplyRequest = await request.json()
    
    validateRequest(body, ['conversation', 'currentReply', 'tone'])
    
    if (!Array.isArray(body.conversation)) {
      throw new ValidationError('Conversation must be an array')
    }
    
    if (!body.currentReply || typeof body.currentReply !== 'string') {
      throw new ValidationError('Current reply must be a non-empty string')
    }
    
    logger.debug('Regenerate reply request validated', {
      conversationLength: body.conversation.length,
      currentReplyLength: body.currentReply.length,
      tone: body.tone,
      userId: user.id
    })
    
    const startTime = Date.now()
    const reply = await conversationService.regenerateReply({
      ...body,
      userId: user.id
    })
    const duration = Date.now() - startTime
    
    logger.performanceLog('regenerate_reply', duration, {
      success: true,
      replyLength: reply.length
    })
    
    logger.businessEvent('conversation_reply_regenerated', {
      tone: body.tone,
      duration,
      userId: user.id
    })
    
    return NextResponse.json({ reply })
  } else {
    const body: GenerateReplyRequest = await request.json()
    
    validateRequest(body, ['conversation', 'tone'])
    
    if (!Array.isArray(body.conversation)) {
      throw new ValidationError('Conversation must be an array')
    }
    
    if (body.conversation.length === 0) {
      throw new ValidationError('Conversation cannot be empty')
    }
    
    logger.debug('Generate replies request validated', {
      conversationLength: body.conversation.length,
      tone: body.tone,
      hasMatchName: !!body.matchName,
      hasOtherInfo: !!body.otherInfo,
      userId: user.id
    })
    
    const startTime = Date.now()
    const replies = await conversationService.generateReplies({
      ...body,
      userId: user.id
    })
    const duration = Date.now() - startTime
    
    logger.performanceLog('generate_replies', duration, {
      success: true,
      repliesCount: replies.length
    })
    
    logger.businessEvent('conversation_replies_generated', {
      tone: body.tone,
      repliesCount: replies.length,
      duration,
      userId: user.id
    })
    
    return NextResponse.json({ replies })
  }
})