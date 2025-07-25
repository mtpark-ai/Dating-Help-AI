type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
  error?: Error
  userId?: string
  requestId?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info'

  private shouldLog(level: LogLevel): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 }
    return levels[level] >= levels[this.logLevel]
  }

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, context, error, userId, requestId } = entry
    let logStr = `[${timestamp}] [${level.toUpperCase()}]`
    
    if (requestId) logStr += ` [${requestId}]`
    if (userId) logStr += ` [User: ${userId}]`
    
    logStr += ` ${message}`
    
    if (context) {
      logStr += ` | Context: ${JSON.stringify(context)}`
    }
    
    if (error) {
      logStr += ` | Error: ${error.message}`
      if (this.isDevelopment && error.stack) {
        logStr += ` | Stack: ${error.stack}`
      }
    }
    
    return logStr
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
      requestId: this.getCurrentRequestId(),
      userId: this.getCurrentUserId()
    }

    const logStr = this.formatLog(entry)
    
    switch (level) {
      case 'error':
        console.error(logStr)
        break
      case 'warn':
        console.warn(logStr)
        break
      case 'debug':
        console.debug(logStr)
        break
      default:
        console.log(logStr)
    }

    if (level === 'error' && !this.isDevelopment) {
      this.sendToExternalService(entry)
    }
  }

  private getCurrentRequestId(): string | undefined {
    return process.env.REQUEST_ID || undefined
  }

  private getCurrentUserId(): string | undefined {
    return process.env.USER_ID || undefined
  }

  private sendToExternalService(entry: LogEntry): void {
    // TODO: 实现外部日志服务集成 (如 DataDog, Sentry, etc.)
    // 这里可以发送到外部监控服务
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('error', message, context, error)
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context)
  }

  // API 专用日志方法
  apiRequest(method: string, url: string, context?: Record<string, any>): void {
    this.info(`API ${method} ${url}`, { ...context, type: 'api_request' })
  }

  apiResponse(method: string, url: string, status: number, duration: number, context?: Record<string, any>): void {
    this.info(`API ${method} ${url} - ${status} (${duration}ms)`, { 
      ...context, 
      type: 'api_response',
      status,
      duration
    })
  }

  apiError(method: string, url: string, error: Error, context?: Record<string, any>): void {
    this.error(`API ${method} ${url} failed`, error, { ...context, type: 'api_error' })
  }

  // 业务逻辑日志方法
  businessEvent(event: string, context?: Record<string, any>): void {
    this.info(`Business Event: ${event}`, { ...context, type: 'business_event' })
  }

  performanceLog(operation: string, duration: number, context?: Record<string, any>): void {
    this.info(`Performance: ${operation} took ${duration}ms`, { 
      ...context, 
      type: 'performance',
      duration
    })
  }
}

export const logger = new Logger()