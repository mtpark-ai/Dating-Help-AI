import type { ProfileAnalysisRequest, ProfileAnalysisResponse } from '@/types'

export async function analyzeProfile(body: ProfileAnalysisRequest): Promise<ProfileAnalysisResponse> {
  console.log('Received request:', { imageCount: body.photos.length, matchName: body.matchName, otherInfo: body.otherInfo })
  
  const apiKey = process.env.OPENAI_API_KEY || "sk-OkCSj0NXkWhE0Sv6Be0dEc773fD74903A1D9Ea983612C6Cf"
  const baseURL = process.env.OPENAI_BASE_URL || "https://api.openai-next.com/v1"

  const analysisPrompt = `You are a professional dating app profile analyst. Carefully analyze these profile images and extract conversation-relevant information.

Output in strict JSON format:
{
  "textContent": ["extracted text from images (interests, work, hobbies, etc.)"],
  "visualContent": ["observed activities, interests, environments, etc."],  
  "summary": "concise personality summary (30-50 characters)",
  "insights": ["specific conversation starters for personalized pickup lines"]
}

Analysis Focus:
1. **textContent**: Extract bio text, tags, profession, interests, and other conversation-relevant text
2. **visualContent**: Observe activity scenes, clothing style, hobbies, lifestyle elements
3. **summary**: Overall personality impression based on analysis
4. **insights**: Provide 3-5 specific conversation entry points, such as:
   - Specific hobbies or activities shown
   - Unique clothing style or accessories
   - Interesting background environments or objects
   - Personality traits displayed
   - Elements that could prompt story-telling

Each insight should be specific enough to be directly used in opening lines, avoiding generic observations.`

  const messages = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: analysisPrompt
        },
        ...body.photos.map(image => ({
          type: "image_url",
          image_url: {
            url: image
          }
        }))
      ]
    }
  ]

  console.log('Making OpenAI API call...')
  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    })
  })

  console.log('OpenAI API response status:', response.status)
  if (!response.ok) {
    const errorText = await response.text()
    console.error('OpenAI API error:', errorText)
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content || ""
  console.log('OpenAI response content:', content)
  
  let analysisResult: ProfileAnalysisResponse

  try {
    // Try to parse JSON response
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const jsonContent = jsonMatch[1] || jsonMatch[0]
      analysisResult = JSON.parse(jsonContent)
    } else {
      throw new Error('No JSON found in response')
    }
  } catch (parseError) {
    console.warn('Failed to parse JSON response, using fallback format')
    
    // Fallback: create structured response from text
    const lines = content.split('\n').filter((line: string) => line.trim())
    analysisResult = {
      textContent: lines.filter((line: string) => line.includes('文字') || line.includes('标签') || line.includes('Text')).slice(0, 3),
      visualContent: lines.filter((line: string) => line.includes('视觉') || line.includes('照片') || line.includes('Visual')).slice(0, 3),
      summary: lines.find((line: string) => line.includes('总结') || line.includes('特点') || line.includes('Summary')) || content.substring(0, 200),
      insights: lines.filter((line: string) => line.includes('建议') || line.includes('话题') || line.includes('建议')).slice(0, 3)
    }
    
    // If still empty, provide fallback data
    if (analysisResult.textContent.length === 0) {
      analysisResult.textContent = ["未能提取到文字内容", "请检查图片质量", "可能需要更清晰的图片"]
    }
    if (analysisResult.visualContent.length === 0) {
      analysisResult.visualContent = ["未能分析视觉内容", "图片可能无法识别", "建议上传更清晰的图片"]
    }
    if (!analysisResult.summary) {
      analysisResult.summary = "无法生成分析总结，请检查图片内容"
    }
    if (analysisResult.insights.length === 0) {
      analysisResult.insights = ["暂无对话建议", "请尝试上传更多信息", "可以从兴趣爱好开始聊天"]
    }
  }

  return analysisResult
}