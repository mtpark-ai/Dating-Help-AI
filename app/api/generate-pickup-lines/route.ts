import { NextRequest, NextResponse } from 'next/server'
import { generatePickupLines } from '@/lib/generate-pickup-lines'
import { handleApiError, wrapAsyncHandler, validateRequest, ValidationError } from '@/lib/error-handler'
import { logger } from '@/lib/logger'
import type { GeneratePickupLinesRequest } from '@/types'

export const POST = wrapAsyncHandler(async (request: NextRequest) => {
  logger.businessEvent('pickup_lines_generation_started')
  
  const body: GeneratePickupLinesRequest = await request.json()
  
  validateRequest(body, ['analysis'])
  
  if (!body.analysis || typeof body.analysis !== 'object') {
    throw new ValidationError('Analysis must be a valid object')
  }
  
  if (!body.analysis.insights || !Array.isArray(body.analysis.insights)) {
    throw new ValidationError('Analysis must contain insights array')
  }
  
  if (!body.analysis.summary || typeof body.analysis.summary !== 'string') {
    throw new ValidationError('Analysis must contain summary string')
  }
  
  logger.debug('Pickup lines generation request validated', {
    hasAnalysis: !!body.analysis,
    insightsCount: body.analysis.insights?.length || 0,
    tone: body.tone
  })
  
  const startTime = Date.now()
  const result = await generatePickupLines(body)
  const duration = Date.now() - startTime
  
  logger.performanceLog('pickup_lines_generation', duration, {
    success: true,
    linesCount: result.lines?.length || 0
  })
  
  logger.businessEvent('pickup_lines_generated', {
    tone: body.tone,
    linesCount: result.lines?.length || 0,
    duration
  })
  
  return NextResponse.json(result)
})