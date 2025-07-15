import { NextRequest, NextResponse } from 'next/server'
import { analyzeProfile } from '@/services/profile-analysis'

interface ProfileAnalysisRequest {
  images: string[] // base64 encoded images
  matchName?: string
  otherInfo?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ProfileAnalysisRequest = await request.json()
    const result = await analyzeProfile(body)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Profile Analysis Error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}