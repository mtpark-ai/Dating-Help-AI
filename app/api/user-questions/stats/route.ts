import { NextResponse } from 'next/server'
import { UserQuestionsService } from '@/lib/user-questions'

export async function GET() {
  try {
    const stats = await UserQuestionsService.getQuestionStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error in GET /api/user-questions/stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
