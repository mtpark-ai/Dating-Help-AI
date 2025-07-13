import { gptService } from '../services/api'

interface Message {
  sender: "match" | "user"
  message: string
}

interface GenerateReplyRequest {
  conversation: Message[]
  matchName?: string
  otherInfo?: string
  tone: string
}

interface GenerateReplyResponse {
  replies: string[]
}

interface RegenerateReplyRequest {
  conversation: Message[]
  matchName?: string
  otherInfo?: string
  tone: string
  currentReply: string
  replyIndex: number
}

interface RegenerateReplyResponse {
  reply: string
}

class ConversationAPI {
  async generateReplies(data: GenerateReplyRequest): Promise<GenerateReplyResponse> {
    try {
      const replies = await gptService.generateReplies(data)
      return { replies }
    } catch (error) {
      console.error('Error generating replies:', error)
      throw new Error('Failed to generate replies')
    }
  }

  async regenerateReply(data: RegenerateReplyRequest): Promise<RegenerateReplyResponse> {
    try {
      const reply = await gptService.regenerateReply(data)
      return { reply }
    } catch (error) {
      console.error('Error regenerating reply:', error)
      throw new Error('Failed to regenerate reply')
    }
  }
}

export const conversationAPI = new ConversationAPI()
export type { 
  Message, 
  GenerateReplyRequest, 
  GenerateReplyResponse, 
  RegenerateReplyRequest, 
  RegenerateReplyResponse 
}