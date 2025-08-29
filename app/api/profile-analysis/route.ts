import { NextRequest, NextResponse } from 'next/server'
import { analyzeProfile } from '@/lib/profile-analysis'
import { handleApiError, wrapAsyncHandler, validateRequest, ValidationError } from '@/lib/error-handler'
import { logger } from '@/lib/logger'
import type { ProfileAnalysisRequest } from '@/types'

export const POST = wrapAsyncHandler(async (request: NextRequest) => {
  logger.businessEvent('profile_analysis_started')
  
  const body: ProfileAnalysisRequest = await request.json()
  
  validateRequest(body, ['bio', 'photos'])
  
  if (!body.bio || typeof body.bio !== 'string') {
    throw new ValidationError('Bio must be a non-empty string')
  }
  
  if (!Array.isArray(body.photos) || body.photos.length === 0) {
    throw new ValidationError('Photos array must contain at least one photo')
  }
  
  logger.debug('Profile analysis request validated', {
    bioLength: body.bio.length,
    photosCount: body.photos.length
  })
  
  const startTime = Date.now()
  const result = await analyzeProfile(body)
  const duration = Date.now() - startTime
  
  logger.performanceLog('profile_analysis', duration, {
    success: true,
    resultLength: JSON.stringify(result).length
  })
  
  logger.businessEvent('profile_analysis_completed', {
    analysisType: 'profile',
    duration
  })
  
  return NextResponse.json(result)
})