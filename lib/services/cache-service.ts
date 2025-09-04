import { BaseService } from './base-service'

export type CacheType = 'ai-response' | 'user-data' | 'analytics' | 'general'

export interface CacheOptions {
  ttl?: number // Time to live in seconds
  type?: CacheType
}

export class CacheService extends BaseService {
  private memoryCache = new Map<string, { value: any; expires: number }>()
  
  constructor() {
    super('CacheService')
    
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanupExpiredEntries()
    }, 5 * 60 * 1000)
  }

  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    return this.handleServiceError('get', async () => {
      // First check memory cache
      const memoryResult = this.getFromMemory<T>(key)
      if (memoryResult !== null) {
        this.log('debug', 'Cache hit (memory)', { key, type: options.type })
        return memoryResult
      }

      // Try Vercel KV if available
      if (process.env.KV_REST_API_URL) {
        try {
          const kvResult = await this.getFromKV<T>(key)
          if (kvResult !== null) {
            // Store in memory for faster access
            this.setInMemory(key, kvResult, options.ttl || 3600)
            this.log('debug', 'Cache hit (KV)', { key, type: options.type })
            return kvResult
          }
        } catch (error) {
          this.log('warn', 'KV cache error, falling back', { key, error })
        }
      }

      this.log('debug', 'Cache miss', { key, type: options.type })
      return null
    })
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    return this.handleServiceError('set', async () => {
      const ttl = options.ttl || 3600 // Default 1 hour

      // Store in memory cache
      this.setInMemory(key, value, ttl)

      // Store in Vercel KV if available
      if (process.env.KV_REST_API_URL) {
        try {
          await this.setInKV(key, value, ttl)
          this.log('debug', 'Cache set (both)', { key, ttl, type: options.type })
        } catch (error) {
          this.log('warn', 'KV cache write failed', { key, error })
          // Memory cache is still set, so we can continue
        }
      } else {
        this.log('debug', 'Cache set (memory only)', { key, ttl, type: options.type })
      }
    })
  }

  async invalidate(pattern: string): Promise<void> {
    return this.handleServiceError('invalidate', async () => {
      // Invalidate memory cache
      const keys = Array.from(this.memoryCache.keys())
      const matchingKeys = keys.filter(key => key.includes(pattern))
      
      matchingKeys.forEach(key => {
        this.memoryCache.delete(key)
      })

      // For KV, we don't have pattern matching, so we'll need to track keys
      // For now, just log the invalidation
      this.log('debug', 'Cache invalidated', { pattern, matchedKeys: matchingKeys.length })
    })
  }

  async getCachedAIResponse(prompt: string, context: string): Promise<string[] | null> {
    const key = `ai:${this.hashString(prompt + context)}`
    return this.get<string[]>(key, { type: 'ai-response' })
  }

  async cacheAIResponse(prompt: string, context: string, responses: string[], ttl: number = 3600): Promise<void> {
    const key = `ai:${this.hashString(prompt + context)}`
    await this.set(key, responses, { ttl, type: 'ai-response' })
  }

  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key)
    
    if (!entry) {
      return null
    }

    if (Date.now() > entry.expires) {
      this.memoryCache.delete(key)
      return null
    }

    return entry.value as T
  }

  private setInMemory<T>(key: string, value: T, ttlSeconds: number): void {
    const expires = Date.now() + (ttlSeconds * 1000)
    this.memoryCache.set(key, { value, expires })
  }

  private async getFromKV<T>(key: string): Promise<T | null> {
    const url = `${process.env.KV_REST_API_URL}/get/${key}`
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.KV_REST_API_TOKEN}`
      }
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`KV GET failed: ${response.status}`)
    }

    const data = await response.json()
    return data.result
  }

  private async setInKV<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const url = `${process.env.KV_REST_API_URL}/set/${key}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.KV_REST_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        value,
        ex: ttlSeconds
      })
    })

    if (!response.ok) {
      throw new Error(`KV SET failed: ${response.status}`)
    }
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expires) {
        this.memoryCache.delete(key)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      this.log('debug', 'Cleaned up expired cache entries', { cleanedCount })
    }
  }

  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  // Health check method
  getStats() {
    return {
      memoryEntries: this.memoryCache.size,
      hasKV: !!process.env.KV_REST_API_URL
    }
  }
}

export const cacheService = new CacheService()