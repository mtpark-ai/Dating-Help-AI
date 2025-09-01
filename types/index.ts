// Common types used across the application

export interface Message {
  sender: "match" | "user"
  message: string
  timestamp?: Date
  metadata?: Record<string, any>
}

// User and Profile Types
export interface UserPreferences {
  defaultTone: 'flirty' | 'funny' | 'casual'
  preferredLanguage: string
  contentFiltering: boolean
  analyticsOptIn: boolean
}

export interface UsageStats {
  totalConversations: number
  totalPickupLines: number
  totalScreenshots: number
  dailyUsage: number
  lastResetDate: string
  tierLevel: 'free' | 'premium'
}

export interface User {
  id: string
  email: string
  createdAt: Date
  lastActiveAt: Date
  preferences: UserPreferences
  usageStats: UsageStats
  metadata?: Record<string, any>
}

// Conversation Types
export interface ConversationContext {
  matchName?: string
  otherInfo?: string
  platform?: 'tinder' | 'bumble' | 'hinge' | 'other'
  relationshipGoal?: string
}

export interface Conversation {
  id: string
  userId: string
  messages: Message[]
  context: ConversationContext
  generatedReplies: string[]
  selectedReply?: string
  tone: 'flirty' | 'funny' | 'casual'
  status: 'active' | 'archived' | 'deleted'
  createdAt: Date
  updatedAt: Date
}

export interface ConversationFilters {
  limit?: number
  offset?: number
  status?: 'active' | 'archived' | 'all'
}

export interface PaginatedResult<T> {
  conversations?: T[]
  total: number
  hasMore?: boolean
}

// Pickup Line Types
export interface PickupLineGeneration {
  id: string
  userId: string
  prompt: string
  generatedLines: string[]
  selectedLine?: string
  tone: 'flirty' | 'funny' | 'casual' | 'clever'
  category: 'opener' | 'icebreaker' | 'compliment' | 'question' | 'custom'
  rating?: number
  metadata?: {
    responseTime?: number
    modelVersion?: string
    contentFiltered?: boolean
  }
  createdAt: Date
}

// Screenshot Analysis Types
export interface AnalysisResult {
  conversationQuality: number
  suggestedImprovements: string[]
  toneAnalysis: {
    detectedTone: string
    confidence: number
  }
  nextStepRecommendations: string[]
  riskFlags: string[]
}

export interface ScreenshotAnalysis {
  id: string
  userId: string
  imageUrl: string
  extractedConversation: Message[]
  analysis: AnalysisResult
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: Date
  processedAt?: Date
  errorMessage?: string
}

// Feedback Types
export interface UserFeedback {
  id: string
  userId: string
  relatedEntityType: 'conversation' | 'pickupLine' | 'screenshot' | 'general'
  relatedEntityId?: string
  rating: number
  feedback?: string
  feedbackType: 'quality' | 'accuracy' | 'helpfulness' | 'appropriateness' | 'bug_report'
  metadata?: {
    userAgent?: string
    page?: string
    sessionDuration?: number
  }
  createdAt: Date
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