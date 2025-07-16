import { NextResponse } from 'next/server'
import { logger } from './logger'

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  GPT_SERVICE_ERROR = 'GPT_SERVICE_ERROR',
  IMAGE_PROCESSING_ERROR = 'IMAGE_PROCESSING_ERROR',
  PARSING_ERROR = 'PARSING_ERROR'
}

export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly context?: Record<string, any>

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.context = context
    
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, true, context)
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, service: string, context?: Record<string, any>) {
    super(message, ErrorCode.EXTERNAL_SERVICE_ERROR, 502, true, {
      ...context,
      service
    })
  }
}

export class GPTServiceError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ErrorCode.GPT_SERVICE_ERROR, 502, true, context)
  }
}

export class ParsingError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ErrorCode.PARSING_ERROR, 422, true, context)
  }
}

interface ErrorResponse {
  error: string
  code: string
  message: string
  details?: string
  requestId?: string
  timestamp: string
}

export function handleApiError(error: unknown, context?: Record<string, any>): NextResponse {
  const requestId = generateRequestId()
  const timestamp = new Date().toISOString()

  if (error instanceof AppError) {
    logger.error(
      `Operational error: ${error.message}`,
      error,
      {
        ...context,
        ...error.context,
        code: error.code,
        statusCode: error.statusCode,
        requestId
      }
    )

    const response: ErrorResponse = {
      error: 'Request failed',
      code: error.code,
      message: error.message,
      requestId,
      timestamp
    }

    if (process.env.NODE_ENV === 'development') {
      response.details = error.stack
    }

    return NextResponse.json(response, { status: error.statusCode })
  }

  if (error instanceof Error) {
    logger.error(
      `Unexpected error: ${error.message}`,
      error,
      {
        ...context,
        requestId,
        stack: error.stack
      }
    )

    const response: ErrorResponse = {
      error: 'Internal server error',
      code: ErrorCode.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
      requestId,
      timestamp
    }

    if (process.env.NODE_ENV === 'development') {
      response.details = error.message
    }

    return NextResponse.json(response, { status: 500 })
  }

  logger.error(
    'Unknown error occurred',
    undefined,
    {
      ...context,
      error: String(error),
      requestId
    }
  )

  return NextResponse.json(
    {
      error: 'Internal server error',
      code: ErrorCode.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
      requestId,
      timestamp
    },
    { status: 500 }
  )
}

export function validateRequest(data: any, requiredFields: string[]): void {
  const missingFields = requiredFields.filter(field => !data?.[field])
  
  if (missingFields.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missingFields.join(', ')}`,
      { missingFields, receivedData: data }
    )
  }
}

export function wrapAsyncHandler(
  handler: (request: any) => Promise<NextResponse>
) {
  return async (request: any) => {
    try {
      const startTime = Date.now()
      const method = request.method
      const url = request.url
      
      logger.apiRequest(method, url, { userAgent: request.headers.get('user-agent') })
      
      const response = await handler(request)
      
      const duration = Date.now() - startTime
      logger.apiResponse(method, url, response.status, duration)
      
      return response
    } catch (error) {
      logger.apiError(request.method, request.url, error as Error)
      return handleApiError(error, {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers.entries())
      })
    }
  }
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.code === ErrorCode.EXTERNAL_SERVICE_ERROR || 
           error.code === ErrorCode.GPT_SERVICE_ERROR
  }
  return false
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: unknown
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries || !isRetryableError(error)) {
        throw error
      }
      
      logger.warn(`Retry attempt ${attempt}/${maxRetries} failed`, {
        error: error instanceof Error ? error.message : String(error),
        nextRetryIn: delayMs * attempt
      })
      
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
    }
  }
  
  throw lastError
}