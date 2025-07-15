import { NextRequest, NextResponse } from 'next/server'
import { generatePickupLines } from '@/services/generate-pickup-lines'

interface GeneratePickupLinesRequest {
  summary: string
  insights: string[]
  tone: string
  matchName?: string
  otherInfo?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: GeneratePickupLinesRequest = await request.json()
    const result = await generatePickupLines(body)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Pickup Lines Generation Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate pickup lines', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}