import { STYLE_PROMPTS } from './config/conversation-prompts'
import { GPTServiceError, ExternalServiceError, ParsingError, withRetry } from './error-handler'
import { logger } from './logger'
import type { 
  Message, 
  GenerateReplyRequest, 
  AnalyzeImageRequest, 
  AnalyzeImageResponse,
  AnalyzeAndGenerateRequest,
  AnalyzeAndGenerateResponse,
  OpenAIMessage
} from '@/types'

const toneTemperatureMap: Record<string, number> = {
  flirty: 0.7,
  funny: 0.65,
  casual: 0.6,
}
function getTemperatureByTone(tone?: string) {
  if (!tone) return 0.7;
  return toneTemperatureMap[tone] ?? 0.7;
}

class GPTService {
  private apiKey: string
  private baseURL: string

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || ""
    this.baseURL = process.env.OPENAI_BASE_URL || ""
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
    logger.debug('Generating replies with GPT service', {
      conversationLength: request.conversation.length,
      tone: request.tone,
      hasMatchName: !!request.matchName,
      hasOtherInfo: !!request.otherInfo
    })

    const systemPrompt = this.buildSystemPrompt(request.tone, request.matchName, request.otherInfo)
    const conversationMessages = this.formatConversationForGPT(request.conversation)

    // 增强的提示词，强调基于整个对话历史生成高情商回复
    const enhancedPrompt = `${systemPrompt}

# Generation Strategy
## Must Accomplish:
1. Carefully analyze the full conversation history and context.
2. Generate emotionally intelligent replies that help deepen the connection.
3. Ensure the reply feels natural and contextually coherent.
4. Responses should be charming, relaxed, and not feel forced.
5. Avoid overly passive expressions — your reply should naturally invite a response.
6. When appropriate, suggest a casual meetup based on shared interests.
7. Word limit: 1–25 English words. You may include one or more emojis in the reply.
8. The user may provide extra information (e.g. match's name or interests) — only weave it in when it fits naturally. Do not mention it forcefully.

# output Requirements: 
- Based on the full conversation history above, generate 3 high-quality replies in the user's selected tone. Separate each reply with a line break.

# Quality Checklist:
1. Does the reply match the selected tone (e.g. flirty, funny, casual)?
2. Is it context-aware and consistent with the conversation history?
3. Does it sound natural, like something a real person would say?
4. Does it subtly advance the relationship or keep the conversation engaging?
5. Does it avoid being too generic, robotic, or emotionally flat?
6. Would it likely receive a reply from the other person?`

    const messages: OpenAIMessage[] = [
      { role: "system", content: enhancedPrompt },
      ...conversationMessages,
      { role: "user", content: "Generate 3 concise, thoughtful and engaging reply options that feel natural, fit the current conversation flow and match the stage of the relationship. Put each reply on a separate line." }
    ]

    return withRetry(async () => {
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
            temperature: getTemperatureByTone(request.tone),
            max_tokens: 150
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          logger.error('OpenAI API error response', undefined, {
            status: response.status,
            statusText: response.statusText,
            responseBody: errorText
          })
          throw new GPTServiceError(
            `OpenAI API error: ${response.status} ${response.statusText}`,
            { status: response.status, responseBody: errorText }
          )
        }

        const data = await response.json()
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new GPTServiceError('Invalid response format from OpenAI API', { response: data })
        }

        const content = data.choices[0].message.content || ""
        
        if (!content.trim()) {
          throw new GPTServiceError('Empty response from OpenAI API', { response: data })
        }
        
        // Split the response into multiple replies
        const replies = content.split('\n').filter((reply: string) => reply.trim().length > 0).slice(0, 3)
        
        // If we don't get enough replies, pad with variations
        while (replies.length < 3) {
          replies.push(replies[0] || "That sounds interesting!")
        }

        logger.debug('Successfully generated replies', {
          repliesCount: replies.length,
          totalLength: replies.join('').length
        })

        return replies
      } catch (error) {
        if (error instanceof GPTServiceError) {
          throw error
        }
        
        logger.error('GPT Service Error in generateReplies', error as Error, {
          conversationLength: request.conversation.length,
          tone: request.tone
        })
        
        throw new GPTServiceError(
          'Failed to generate replies from GPT service',
          { originalError: error instanceof Error ? error.message : String(error) }
        )
      }
    }, 3, 1000)
  }

  async regenerateReply(request: GenerateReplyRequest & { currentReply: string }): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(request.tone, request.matchName, request.otherInfo)
    const conversationMessages = this.formatConversationForGPT(request.conversation)

    // 增强的重新生成提示
    const enhancedPrompt = `${systemPrompt}

Important instructions:
- Generate a new high-quality reply based on the full conversation history  
- Maintain the same tone as the previous replies, allow slight stylistic variations, and ensure the overall quality is higher 
- Ensure the new reply is more charming and engaging  
- Consider the best direction for the conversation to develop`

    const messages: OpenAIMessage[] = [
      { role: "system", content: enhancedPrompt },
      ...conversationMessages,
      { role: "user", content: `Generate a new reply that differs from the current one, but is of higher quality：${request.currentReply}。The new reply should be more charming and fit the conversation development needs.` }
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
          temperature: getTemperatureByTone(request.tone),
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
    const systemPrompt = `You are a professional chat transcript analyst. Please analyze the provided chat screenshot and extract all conversation text.

Task requirements:
1. Carefully observe the chat interface, including left/right bubble positions, colors, and avatar locations.
2. Distinguish which messages are from the other person ("match") and which are from me ("user").
3. Arrange all messages in chronological order.
4. The output format must be a JSON array containing two keys: sender and message.
5. The sender field must have a value of either match or user.

Example output format:
[
  {"sender": "match", "message": "Message content"},
  {"sender": "user", "message": "Message content"}
]

Notes:
- Carefully capture all text, including emojis and special characters.
- Ensure the messages are in the correct chronological order.
- Do not omit any conversation content.
- Return only the JSON array without any additional explanation or text.`

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
          temperature: getTemperatureByTone(),
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