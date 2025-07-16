import { NextRequest, NextResponse } from 'next/server'
import { gptService } from '@/lib/gpt-service'
import type { AnalyzeImageRequest, AnalyzeAndGenerateRequest } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    
    if (action === 'analyze-and-generate') {
      const body: AnalyzeAndGenerateRequest = await request.json()
      const result = await gptService.analyzeScreenshotAndGenerate(body)
      return NextResponse.json(result)
    } else {
      const body: AnalyzeImageRequest = await request.json()
      const result = await gptService.analyzeScreenshot(body)
      return NextResponse.json(result)
    }
  } catch (error) {
    console.error('Screenshot Analysis Error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze screenshot', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}