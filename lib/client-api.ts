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

export class ClientAPIError extends Error {
  public readonly status: number
  public readonly code: string
  public readonly requestId?: string
  public readonly timestamp?: string

  constructor(
    message: string,
    status: number,
    code: string = 'CLIENT_API_ERROR',
    requestId?: string,
    timestamp?: string
  ) {
    super(message)
    this.status = status
    this.code = code
    this.requestId = requestId
    this.timestamp = timestamp
    this.name = 'ClientAPIError'
  }
}

class ClientAPI {
  private async request<T>(url: string, data: any, options: { timeout?: number } = {}): Promise<T> {
    const { timeout = 30000 } = options
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      console.log(`Making API request to ${url}`, { 
        timestamp: new Date().toISOString(),
        dataKeys: Object.keys(data || {})
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        console.error(`API Error: ${url}`, {
          status: response.status,
          statusText: response.statusText,
          errorData,
          timestamp: new Date().toISOString()
        })

        throw new ClientAPIError(
          errorData.message || `API Error: ${response.status} ${response.statusText}`,
          response.status,
          errorData.code || 'API_ERROR',
          errorData.requestId,
          errorData.timestamp
        )
      }

      const result = await response.json()
      
      console.log(`API request successful: ${url}`, {
        timestamp: new Date().toISOString(),
        hasResult: !!result
      })

      return result
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof ClientAPIError) {
        throw error
      }
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error(`API request timeout: ${url}`, {
          timeout,
          timestamp: new Date().toISOString()
        })
        throw new ClientAPIError(
          'Request timeout. Please try again.',
          408,
          'TIMEOUT_ERROR'
        )
      }

      console.error(`API request failed: ${url}`, {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      })

      throw new ClientAPIError(
        'Network error. Please check your connection and try again.',
        0,
        'NETWORK_ERROR'
      )
    }
  }

  private async retryRequest<T>(
    requestFn: () => Promise<T>, 
    maxRetries: number = 2,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn()
      } catch (error) {
        lastError = error as Error
        
        if (error instanceof ClientAPIError) {
          // Don't retry client errors (4xx) except for timeout
          if (error.status >= 400 && error.status < 500 && error.status !== 408) {
            throw error
          }
        }
        
        if (attempt === maxRetries) {
          throw error
        }
        
        console.warn(`Request attempt ${attempt} failed, retrying in ${delayMs}ms`, {
          error: error instanceof Error ? error.message : String(error),
          attempt,
          maxRetries
        })
        
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
      }
    }
    
    throw lastError!
  }

  async generateReplies(data: GenerateReplyRequest): Promise<GenerateReplyResponse> {
    return this.retryRequest(() => 
      this.request<GenerateReplyResponse>('/api/conversation', data, { timeout: 45000 })
    )
  }

  async regenerateReply(data: RegenerateReplyRequest): Promise<RegenerateReplyResponse> {
    return this.retryRequest(() =>
      this.request<RegenerateReplyResponse>('/api/conversation?action=regenerate', data, { timeout: 45000 })
    )
  }

  async analyzeProfile(data: ProfileAnalysisRequest): Promise<ProfileAnalysisResponse> {
    return this.retryRequest(() =>
      this.request<ProfileAnalysisResponse>('/api/profile-analysis', data, { timeout: 60000 })
    )
  }

  async generatePickupLines(data: GeneratePickupLinesRequest): Promise<GeneratePickupLinesResponse> {
    return this.retryRequest(() =>
      this.request<GeneratePickupLinesResponse>('/api/generate-pickup-lines', data, { timeout: 45000 })
    )
  }

  async analyzeScreenshot(data: AnalyzeImageRequest): Promise<AnalyzeImageResponse> {
    return this.retryRequest(() =>
      this.request<AnalyzeImageResponse>('/api/screenshot-analysis', data, { timeout: 60000 })
    )
  }

  async analyzeScreenshotAndGenerate(data: AnalyzeAndGenerateRequest): Promise<AnalyzeAndGenerateResponse> {
    return this.retryRequest(() =>
      this.request<AnalyzeAndGenerateResponse>('/api/screenshot-analysis?action=analyze-and-generate', data, { timeout: 75000 })
    )
  }
}

export const clientAPI = new ClientAPI()
export { type Message }