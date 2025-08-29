// Common types used across the application

export interface Message {
  sender: "match" | "user"
  message: string
}

export interface GenerateReplyRequest {
  conversation: Message[]
  matchName?: string
  otherInfo?: string
  tone: string
}

export interface GenerateReplyResponse {
  replies: string[]
}

export interface RegenerateReplyRequest extends GenerateReplyRequest {
  currentReply: string
  replyIndex: number
}

export interface RegenerateReplyResponse {
  reply: string
}

export interface ProfileAnalysisRequest {
  bio: string
  photos: string[] // base64 encoded images
  matchName?: string
  otherInfo?: string
}

export interface ProfileAnalysisResponse {
  textContent: string[]
  visualContent: string[]
  summary: string
  insights: string[]
}

export interface GeneratePickupLinesRequest {
  analysis: {
    summary: string
    insights: string[]
  }
  tone: string
  matchName?: string
  otherInfo?: string
}

export interface GeneratePickupLinesResponse {
  lines: string[]
}

export interface AnalyzeImageRequest {
  imageBase64: string
  matchName?: string
}

export interface AnalyzeImageResponse {
  conversation: Message[]
  success: boolean
  error?: string
}

export interface AnalyzeAndGenerateRequest {
  imageBase64: string
  matchName?: string
  otherInfo?: string
  tone: string
}

export interface AnalyzeAndGenerateResponse {
  conversation: Message[]
  replies: string[]
  success: boolean
  error?: string
}

export interface OpenAIMessage {
  role: "system" | "user" | "assistant"
  content: string | Array<{
    type: "text" | "image_url"
    text?: string
    image_url?: {
      url: string
    }
  }>
}

export interface UserQuestion {
  id: string
  email: string
  question: string
  status: 'pending' | 'in_progress' | 'answered' | 'closed'
  admin_response?: string
  created_at: string
  updated_at: string
  admin_updated_at?: string
}

export interface CreateUserQuestionRequest {
  email: string
  question: string
}

export interface UpdateUserQuestionRequest {
  status?: 'pending' | 'in_progress' | 'answered' | 'closed'
  admin_response?: string
}