import { logger } from '../logger'

export abstract class BaseService {
  protected readonly serviceName: string

  constructor(serviceName: string) {
    this.serviceName = serviceName
  }

  protected log(level: 'info' | 'warn' | 'error' | 'debug', message: string, meta?: any) {
    logger[level](`[${this.serviceName}] ${message}`, meta)
  }

  protected async handleServiceError<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    try {
      const startTime = Date.now()
      const result = await fn()
      const duration = Date.now() - startTime
      
      this.log('debug', `${operation} completed`, { duration })
      return result
    } catch (error) {
      this.log('error', `${operation} failed`, { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  }
}