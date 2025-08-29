import { NextRequest, NextResponse } from 'next/server'
import { UserQuestionsService } from '@/lib/user-questions'
import { UpdateUserQuestionRequest } from '@/types'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: UpdateUserQuestionRequest = await request.json()
    
    const question = await UserQuestionsService.updateQuestion(params.id, body)
    
    if (!question) {
      return NextResponse.json(
        { error: 'Failed to update question' },
        { status: 500 }
      )
    }

    return NextResponse.json({ question })
  } catch (error) {
    console.error('Error in PUT /api/user-questions/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await UserQuestionsService.deleteQuestion(params.id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete question' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Question deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/user-questions/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
