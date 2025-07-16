import { STYLE_PROMPTS } from './config/conversation-prompts'
import type { 
  Message, 
  GenerateReplyRequest, 
  AnalyzeImageRequest, 
  AnalyzeImageResponse,
  AnalyzeAndGenerateRequest,
  AnalyzeAndGenerateResponse,
  OpenAIMessage
} from '@/types'


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

  async analyzeScreenshot(request: AnalyzeImageRequest): Promise<AnalyzeImageResponse> {
    const systemPrompt = `你是一个专业的聊天记录分析师。请分析提供的聊天截图，提取所有对话文本信息。

任务要求：
1. 仔细观察聊天界面的左右布局、颜色、头像位置等特征
2. 区分哪些是对方（Match）的消息，哪些是我的消息
3. 按照时间顺序整理所有对话内容
4. 输出格式为JSON数组，包含sender和message字段
5. sender字段只能是"match"或"user"

输出格式示例：
[
  {"sender": "match", "message": "消息内容"},
  {"sender": "user", "message": "消息内容"}
]

注意事项：
- 仔细识别文本内容，包括表情符号和特殊字符
- 确保消息的时间顺序正确
- 不要遗漏任何对话内容
- 只返回JSON数组，不要其他解释文字`

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "chatgpt-4o-latest",
          messages: [
            { role: "system", content: systemPrompt },
            { 
              role: "user", 
              content: [
                {
                  type: "text",
                  text: "请分析这个聊天截图，提取所有对话信息并按要求格式输出："
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${request.imageBase64}`
                  }
                }
              ]
            }
          ],
          temperature: 0.1,
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content || ""
      
      try {
        // 提取JSON部分
        const jsonMatch = content.match(/\[[\s\S]*\]/)
        if (!jsonMatch) {
          throw new Error("无法解析对话内容")
        }
        
        const conversation = JSON.parse(jsonMatch[0])
        
        // 验证数据格式
        if (!Array.isArray(conversation)) {
          throw new Error("对话数据格式不正确")
        }
        
        const validatedConversation: Message[] = conversation.map((item: any) => {
          if (!item.sender || !item.message) {
            throw new Error("消息格式不完整")
          }
          if (item.sender !== "match" && item.sender !== "user") {
            throw new Error("sender字段只能是match或user")
          }
          return {
            sender: item.sender,
            message: item.message.trim()
          }
        })
        
        return {
          conversation: validatedConversation,
          success: true
        }
        
      } catch (parseError) {
        console.error('解析对话内容失败:', parseError)
        return {
          conversation: [],
          success: false,
          error: "解析对话内容失败，请确保截图清晰且包含聊天对话"
        }
      }
      
    } catch (error) {
      console.error('Screenshot Analysis Error:', error)
      return {
        conversation: [],
        success: false,
        error: "分析截图失败，请重试"
      }
    }
  }

  async analyzeScreenshotAndGenerate(request: AnalyzeAndGenerateRequest): Promise<AnalyzeAndGenerateResponse> {
    try {
      // 首先分析截图提取对话
      const analyzeResult = await this.analyzeScreenshot({
        imageBase64: request.imageBase64,
        matchName: request.matchName
      })

      if (!analyzeResult.success) {
        return {
          conversation: [],
          replies: [],
          success: false,
          error: analyzeResult.error
        }
      }

      // 如果没有对话内容，返回错误
      if (analyzeResult.conversation.length === 0) {
        return {
          conversation: [],
          replies: [],
          success: false,
          error: "未能从截图中提取到有效的对话内容"
        }
      }

      // 基于提取的对话生成回复
      const replyResult = await this.generateReplies({
        conversation: analyzeResult.conversation,
        matchName: request.matchName,
        otherInfo: request.otherInfo,
        tone: request.tone
      })

      return {
        conversation: analyzeResult.conversation,
        replies: replyResult,
        success: true
      }

    } catch (error) {
      console.error('Analyze and Generate Error:', error)
      return {
        conversation: [],
        replies: [],
        success: false,
        error: "分析截图并生成回复失败，请重试"
      }
    }
  }
}

export const gptService = new GPTService()