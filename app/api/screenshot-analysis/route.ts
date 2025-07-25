import { NextRequest, NextResponse } from 'next/server'
import { gptService } from '@/lib/gpt-service'
import { handleApiError, wrapAsyncHandler, validateRequest, ValidationError } from '@/lib/error-handler'
import { logger } from '@/lib/logger'
import type { AnalyzeImageRequest, AnalyzeAndGenerateRequest } from '@/types'

export const POST = wrapAsyncHandler(async (request: NextRequest) => {
  const url = new URL(request.url)
  const action = url.searchParams.get('action')
  
  logger.businessEvent('screenshot_analysis_started', { action })
  
  if (action === 'analyze-and-generate') {
    const body: AnalyzeAndGenerateRequest = await request.json()
    
    validateRequest(body, ['imageBase64', 'tone'])
    
    if (!body.imageBase64 || typeof body.imageBase64 !== 'string') {
      throw new ValidationError('Image base64 must be a non-empty string')
    }
    
    if (body.imageBase64.length < 100) {
      throw new ValidationError('Image base64 appears to be too short')
    }
    
    logger.debug('Analyze and generate request validated', {
      imageSize: body.imageBase64.length,
      tone: body.tone,
      hasMatchName: !!body.matchName,
      hasOtherInfo: !!body.otherInfo
    })
    
    const startTime = Date.now()
    const result = await gptService.analyzeScreenshotAndGenerate(body)
    const duration = Date.now() - startTime
    
    logger.performanceLog('screenshot_analyze_and_generate', duration, {
      success: result.success,
      conversationLength: result.conversation?.length || 0,
      repliesCount: result.replies?.length || 0
    })
    
    logger.businessEvent('screenshot_analyzed_and_generated', {
      tone: body.tone,
      success: result.success,
      conversationLength: result.conversation?.length || 0,
      repliesCount: result.replies?.length || 0,
      duration
    })
    
    return NextResponse.json(result)
  } else {
    const body: AnalyzeImageRequest = await request.json()
    
    validateRequest(body, ['imageBase64'])
    
    if (!body.imageBase64 || typeof body.imageBase64 !== 'string') {
      throw new ValidationError('Image base64 must be a non-empty string')
    }
    
    if (body.imageBase64.length < 100) {
      throw new ValidationError('Image base64 appears to be too short')
    }
    
    logger.debug('Screenshot analysis request validated', {
      imageSize: body.imageBase64.length,
      hasMatchName: !!body.matchName
    })
    
    const startTime = Date.now()
    const result = await gptService.analyzeScreenshot(body)
    const duration = Date.now() - startTime
    
    logger.performanceLog('screenshot_analysis', duration, {
      success: result.success,
      conversationLength: result.conversation?.length || 0
    })
    
    logger.businessEvent('screenshot_analyzed', {
      success: result.success,
      conversationLength: result.conversation?.length || 0,
      duration
    })
    
    return NextResponse.json(result)
  }
})