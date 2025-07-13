import { STYLE_PROMPTS } from './config/prompts.js'

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

interface OpenAIMessage {
  role: "system" | "user" | "assistant"
  content: string
}

class GPTService {
  private apiKey: string
  private baseURL: string

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || "sk-OkCSj0NXkWhE0Sv6Be0dEc773fD74903A1D9Ea983612C6Cf"
    this.baseURL = process.env.OPENAI_BASE_URL || "https://api.openai-next.com/v1"
  }

  private buildSystemPrompt(tone: string, matchName?: string, otherInfo?: string): string {
    let basePrompt = STYLE_PROMPTS[tone as keyof typeof STYLE_PROMPTS] || STYLE_PROMPTS.casual

    if (matchName || otherInfo) {
      basePrompt += "\n\n背景信息（仅在相关时自然使用，大多数情况下不需要提及）："
      if (matchName) {
        basePrompt += `\n- 对方名字：${matchName}`
      }
      if (otherInfo) {
        basePrompt += `\n- 了解的信息：${otherInfo}`
      }
      basePrompt += "\n\n记住：这些信息是帮助你更好理解对方，不是每次都要提及的内容。"
    }

    return basePrompt
  }

  private formatConversationForGPT(conversation: Message[]): OpenAIMessage[] {
    return conversation.map(msg => ({
      role: msg.sender === "user" ? "assistant" : "user",
      content: msg.message
    }))
  }

  async generateReplies(request: GenerateReplyRequest): Promise<string[]> {
    const systemPrompt = this.buildSystemPrompt(request.tone, request.matchName, request.otherInfo)
    const conversationMessages = this.formatConversationForGPT(request.conversation)

    // 增强的提示词，强调基于整个对话历史生成高情商回复
    const enhancedPrompt = `${systemPrompt}

重要指示：
- 仔细分析整个对话历史和语境
- 生成能够推进关系发展的高情商回复
- 考虑对话的自然流动性和连贯性
- 回复要有魅力、自然且不做作
- 避免过于直接或被动的表达

请基于以上完整的对话历史，生成3个不同风格但都高质量的回复选项，每个回复用换行分隔。`

    const messages: OpenAIMessage[] = [
      { role: "system", content: enhancedPrompt },
      ...conversationMessages,
      { role: "user", content: "请为我生成3个高情商、有魅力的回复选项，要求简短自然，符合当前对话语境和关系发展阶段。每个回复用换行分隔。" }
    ]

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "chatgpt-4o-latest",
          messages: messages,
          temperature: 0.8,
          max_tokens: 150
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content || ""
      
      // Split the response into multiple replies
      const replies = content.split('\n').filter((reply: string) => reply.trim().length > 0).slice(0, 3)
      
      // If we don't get enough replies, pad with variations
      while (replies.length < 3) {
        replies.push(replies[0] || "That sounds interesting!")
      }

      return replies
    } catch (error) {
      console.error('GPT Service Error:', error)
      throw error
    }
  }

  async regenerateReply(request: GenerateReplyRequest & { currentReply: string }): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(request.tone, request.matchName, request.otherInfo)
    const conversationMessages = this.formatConversationForGPT(request.conversation)

    // 增强的重新生成提示
    const enhancedPrompt = `${systemPrompt}

重要指示：
- 基于完整对话历史生成新的高质量回复
- 要与之前的回复风格不同但质量更高
- 确保新回复更有魅力和吸引力
- 考虑对话发展的最佳方向`

    const messages: OpenAIMessage[] = [
      { role: "system", content: enhancedPrompt },
      ...conversationMessages,
      { role: "user", content: `请生成一个与此回复不同但更优质的新回复：${request.currentReply}。新回复要更有魅力，更符合对话发展需要。` }
    ]

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "chatgpt-4o-latest",
          messages: messages,
          temperature: 0.9,
          max_tokens: 100
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || "That's interesting!"
    } catch (error) {
      console.error('GPT Service Error:', error)
      throw error
    }
  }
}

export const gptService = new GPTService()
export type { Message, GenerateReplyRequest }