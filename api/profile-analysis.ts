interface ProfileAnalysisRequest {
  images: string[] // base64 encoded images
  matchName?: string
  otherInfo?: string
}

interface ProfileAnalysisResponse {
  textContent: string[]
  visualContent: string[]
  summary: string
  insights: string[]
}

class ProfileAnalysisAPI {
  private apiKey: string
  private baseURL: string

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || "sk-OkCSj0NXkWhE0Sv6Be0dEc773fD74903A1D9Ea983612C6Cf"
    this.baseURL = process.env.OPENAI_BASE_URL || "https://api.openai-next.com/v1"
  }

  async analyzeProfile(request: ProfileAnalysisRequest): Promise<ProfileAnalysisResponse> {
    try {
      const analysisPrompt = `
请分析这些约会应用的个人资料图片，重点关注以下内容：

1. 文字信息提取（优先级最高）：
   - 提取所有可见的文字、标签、描述
   - 包括个人资料中的兴趣爱好、职业信息、个人描述等
   - 注意文字信息密度高，是了解对方的重要线索

2. 视觉内容分析：
   - 分析照片中的活动、场景、物品
   - 推断可能的兴趣爱好和生活方式
   - 注意服装风格、环境背景等细节

3. 综合分析：
   - 根据文字和视觉信息，总结这个人的特点
   - 提供可能的聊天切入点和话题建议
   - 分析对方可能感兴趣的话题

请以JSON格式返回分析结果，包含：
- textContent: 提取的文字内容数组
- visualContent: 视觉内容描述数组  
- summary: 综合分析总结
- insights: 聊天建议和话题切入点数组

分析时请优先关注文字信息，因为这些信息密度更高，更能准确反映对方的特点。
`

      const messages = [
        {
          role: "system",
          content: analysisPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "请分析这些个人资料图片："
            },
            ...request.images.map(image => ({
              type: "image_url",
              image_url: {
                url: image
              }
            }))
          ]
        }
      ]

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "chatgpt-4o-latest",
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content || ""
      
      try {
        // Try to parse JSON response
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const jsonContent = jsonMatch[1] || jsonMatch[0]
          return JSON.parse(jsonContent)
        }
      } catch (parseError) {
        console.warn('Failed to parse JSON response, using fallback format')
      }

      // Fallback: create structured response from text
      const lines = content.split('\n').filter(line => line.trim())
      return {
        textContent: lines.filter(line => line.includes('文字') || line.includes('标签')).slice(0, 3),
        visualContent: lines.filter(line => line.includes('视觉') || line.includes('照片')).slice(0, 3),
        summary: lines.find(line => line.includes('总结') || line.includes('特点')) || content.substring(0, 200),
        insights: lines.filter(line => line.includes('建议') || line.includes('话题')).slice(0, 3)
      }
    } catch (error) {
      console.error('Profile Analysis Error:', error)
      throw error
    }
  }
}

export const profileAnalysisAPI = new ProfileAnalysisAPI()
export type { ProfileAnalysisRequest, ProfileAnalysisResponse }