import { NextRequest, NextResponse } from 'next/server'
import { gptService } from '@/lib/gpt-service'
import type { GenerateReplyRequest, RegenerateReplyRequest } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    
    if (action === 'regenerate') {
      const body: RegenerateReplyRequest = await request.json()
      const reply = await gptService.regenerateReply(body)
      return NextResponse.json({ reply })
    } else {
      const body: GenerateReplyRequest = await request.json()
      const replies = await gptService.generateReplies(body)
      return NextResponse.json({ replies })
    }
  } catch (error) {
    console.error('Conversation API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process conversation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}