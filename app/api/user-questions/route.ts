import { NextRequest, NextResponse } from 'next/server'
import { UserQuestionsService } from '@/lib/user-questions'
import { CreateUserQuestionRequest } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserQuestionRequest = await request.json()
    
    // 验证请求数据
    if (!body.email || !body.question) {
      return NextResponse.json(
        { error: 'Email and question are required' },
        { status: 400 }
      )
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // 创建问题
    const question = await UserQuestionsService.createQuestion(body)
    
    if (!question) {
      console.error('UserQuestionsService.createQuestion returned null')
      return NextResponse.json(
        { error: 'Failed to create question - service returned null' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Question submitted successfully',
        question 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/user-questions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
      )
    }
  }

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    let questions
    
    if (email) {
      // 根据邮箱获取问题
      questions = await UserQuestionsService.getQuestionsByEmail(email)
    } else {
      // 获取所有问题（管理员用）
      questions = await UserQuestionsService.getAllQuestions()
    }
    
    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Error in GET /api/user-questions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
