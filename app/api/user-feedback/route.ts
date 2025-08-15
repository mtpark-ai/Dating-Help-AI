import { NextRequest, NextResponse } from 'next/server'
import { UserFeedbackService } from '@/lib/user-feedback'
import { CreateUserFeedbackRequest } from '@/lib/user-feedback'

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserFeedbackRequest = await request.json()
    
    // 验证请求数据
    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (!body.page_source) {
      return NextResponse.json(
        { error: 'Page source is required' },
        { status: 400 }
      )
    }

    // 创建反馈
    const feedback = await UserFeedbackService.createFeedback(body)
    
    if (!feedback) {
      return NextResponse.json(
        { error: 'Failed to create feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Feedback submitted successfully',
        feedback 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/user-feedback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageSource = searchParams.get('page_source')
    
    let feedback
    
    if (pageSource) {
      // 根据页面来源获取反馈
      feedback = await UserFeedbackService.getFeedbackByPageSource(pageSource)
    } else {
      // 获取所有反馈（管理员用）
      feedback = await UserFeedbackService.getAllFeedback()
    }
    
    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('Error in GET /api/user-feedback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
