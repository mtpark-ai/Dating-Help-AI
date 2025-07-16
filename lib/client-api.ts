import type { 
  Message, 
  GenerateReplyRequest, 
  GenerateReplyResponse,
  RegenerateReplyRequest,
  RegenerateReplyResponse,
  ProfileAnalysisRequest,
  ProfileAnalysisResponse,
  GeneratePickupLinesRequest,
  GeneratePickupLinesResponse,
  AnalyzeImageRequest,
  AnalyzeImageResponse,
  AnalyzeAndGenerateRequest,
  AnalyzeAndGenerateResponse
} from '@/types'

class ClientAPI {
  private async request<T>(url: string, data: any): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async generateReplies(data: GenerateReplyRequest): Promise<GenerateReplyResponse> {
    return this.request<GenerateReplyResponse>('/api/conversation', data)
  }

  async regenerateReply(data: RegenerateReplyRequest): Promise<RegenerateReplyResponse> {
    return this.request<RegenerateReplyResponse>('/api/conversation?action=regenerate', data)
  }

  async analyzeProfile(data: ProfileAnalysisRequest): Promise<ProfileAnalysisResponse> {
    return this.request<ProfileAnalysisResponse>('/api/profile-analysis', data)
  }

  async generatePickupLines(data: GeneratePickupLinesRequest): Promise<GeneratePickupLinesResponse> {
    return this.request<GeneratePickupLinesResponse>('/api/generate-pickup-lines', data)
  }

  async analyzeScreenshot(data: AnalyzeImageRequest): Promise<AnalyzeImageResponse> {
    return this.request<AnalyzeImageResponse>('/api/screenshot-analysis', data)
  }

  async analyzeScreenshotAndGenerate(data: AnalyzeAndGenerateRequest): Promise<AnalyzeAndGenerateResponse> {
    return this.request<AnalyzeAndGenerateResponse>('/api/screenshot-analysis?action=analyze-and-generate', data)
  }
}

export const clientAPI = new ClientAPI()
export { type Message }