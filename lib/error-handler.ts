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
  PARSING_ERROR = 'PARSING_ERROR',
  // Authentication specific error codes
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',
  AUTH_EMAIL_NOT_CONFIRMED = 'AUTH_EMAIL_NOT_CONFIRMED',
  AUTH_EMAIL_ALREADY_EXISTS = 'AUTH_EMAIL_ALREADY_EXISTS',
  AUTH_WEAK_PASSWORD = 'AUTH_WEAK_PASSWORD',
  AUTH_SIGNUP_DISABLED = 'AUTH_SIGNUP_DISABLED',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  AUTH_RATE_LIMITED = 'AUTH_RATE_LIMITED',
  AUTH_PROFILE_UPDATE_FAILED = 'AUTH_PROFILE_UPDATE_FAILED',
  AUTH_PASSWORD_RESET_FAILED = 'AUTH_PASSWORD_RESET_FAILED',
  AUTH_MAGIC_LINK_FAILED = 'AUTH_MAGIC_LINK_FAILED'
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

// Authentication specific error classes
export class AuthError extends AppError {
  constructor(
    message: string, 
    code: ErrorCode = ErrorCode.AUTHENTICATION_ERROR, 
    statusCode: number = 401,
    context?: Record<string, any>
  ) {
    super(message, code, statusCode, true, context)
  }
}

export class AuthInvalidCredentialsError extends AuthError {
  constructor(context?: Record<string, any>) {
    super('Invalid login credentials', ErrorCode.AUTH_INVALID_CREDENTIALS, 401, context)
  }
}

export class AuthUserNotFoundError extends AuthError {
  constructor(context?: Record<string, any>) {
    super('User not found', ErrorCode.AUTH_USER_NOT_FOUND, 404, context)
  }
}

export class AuthEmailNotConfirmedError extends AuthError {
  constructor(context?: Record<string, any>) {
    super('Email address not confirmed', ErrorCode.AUTH_EMAIL_NOT_CONFIRMED, 401, context)
  }
}

export class AuthEmailAlreadyExistsError extends AuthError {
  constructor(context?: Record<string, any>) {
    super('An account with this email already exists', ErrorCode.AUTH_EMAIL_ALREADY_EXISTS, 409, context)
  }
}

export class AuthWeakPasswordError extends AuthError {
  constructor(context?: Record<string, any>) {
    super('Password does not meet security requirements', ErrorCode.AUTH_WEAK_PASSWORD, 400, context)
  }
}

export class AuthSignupDisabledError extends AuthError {
  constructor(context?: Record<string, any>) {
    super('User registration is currently disabled', ErrorCode.AUTH_SIGNUP_DISABLED, 403, context)
  }
}

export class AuthSessionExpiredError extends AuthError {
  constructor(context?: Record<string, any>) {
    // Provide different messages based on context
    const reason = context?.reason
    let message = 'Your session has expired. Please log in again'
    
    if (reason === 'session_missing') {
      message = 'Please sign in to continue'
    } else if (reason === 'session_expired') {
      message = 'Your session has expired. Please sign in again'
    } else if (reason === 'session_invalid') {
      message = 'Your session is invalid. Please sign in again'
    }
    
    super(message, ErrorCode.AUTH_SESSION_EXPIRED, 401, context)
  }
}

export class AuthTokenInvalidError extends AuthError {
  constructor(context?: Record<string, any>) {
    super('Invalid or expired authentication token', ErrorCode.AUTH_TOKEN_INVALID, 401, context)
  }
}

export class AuthRateLimitedError extends AuthError {
  constructor(context?: Record<string, any>) {
    super('Too many authentication attempts. Please try again later', ErrorCode.AUTH_RATE_LIMITED, 429, context)
  }
}

export class AuthProfileUpdateFailedError extends AuthError {
  constructor(context?: Record<string, any>) {
    super('Failed to update user profile', ErrorCode.AUTH_PROFILE_UPDATE_FAILED, 400, context)
  }
}

export class AuthPasswordResetFailedError extends AuthError {
  constructor(context?: Record<string, any>) {
    super('Failed to send password reset email', ErrorCode.AUTH_PASSWORD_RESET_FAILED, 400, context)
  }
}

export class AuthMagicLinkFailedError extends AuthError {
  constructor(context?: Record<string, any>) {
    super('Failed to send magic link', ErrorCode.AUTH_MAGIC_LINK_FAILED, 400, context)
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
           error.code === ErrorCode.GPT_SERVICE_ERROR ||
           error.code === ErrorCode.AUTH_SESSION_EXPIRED ||
           error.code === ErrorCode.AUTH_TOKEN_INVALID
  }
  return false
}

// Authentication error mapping from Supabase errors
export function mapSupabaseAuthError(error: any): AuthError {
  if (!error || !error.message) {
    return new AuthError('Unknown authentication error')
  }

  const message = error.message.toLowerCase()
  const context = {
    originalError: error.message,
    supabaseCode: error.status || error.code,
    timestamp: new Date().toISOString()
  }

  // Map common Supabase auth error messages to our error types
  if (message.includes('invalid login credentials') || 
      message.includes('invalid email or password')) {
    return new AuthInvalidCredentialsError(context)
  }

  if (message.includes('user not found') || 
      message.includes('no user found')) {
    return new AuthUserNotFoundError(context)
  }

  if (message.includes('email not confirmed') || 
      message.includes('email address not confirmed')) {
    return new AuthEmailNotConfirmedError(context)
  }

  if (message.includes('user already registered') || 
      message.includes('already been registered') ||
      message.includes('already exists')) {
    return new AuthEmailAlreadyExistsError(context)
  }

  if (message.includes('password') && 
      (message.includes('weak') || message.includes('too short') || 
       message.includes('requirements'))) {
    return new AuthWeakPasswordError(context)
  }

  if (message.includes('signup') && message.includes('disabled')) {
    return new AuthSignupDisabledError(context)
  }

  if (message.includes('session') && 
      (message.includes('expired') || message.includes('invalid') || 
       message.includes('missing') || message.includes('not found'))) {
    return new AuthSessionExpiredError(context)
  }

  if (message.includes('token') && 
      (message.includes('expired') || message.includes('invalid'))) {
    return new AuthTokenInvalidError(context)
  }

  if (message.includes('rate limit') || message.includes('too many')) {
    return new AuthRateLimitedError(context)
  }

  // Handle specific "Auth session missing" and related cases
  if (message.includes('auth session missing') || 
      message.includes('session missing') ||
      message.includes('no session found') ||
      message.includes('session not found') ||
      message.includes('no active session')) {
    return new AuthSessionExpiredError({
      ...context,
      reason: 'session_missing',
      userFriendlyMessage: 'Please sign in to continue',
      isExpectedError: true // Mark this as an expected error, not a real problem
    })
  }

  // Default to generic auth error
  return new AuthError(error.message, ErrorCode.AUTHENTICATION_ERROR, 401, context)
}

// Client-side error handler for authentication
export interface AuthErrorResult {
  error: AuthError | null
  userMessage: string
  shouldRetry: boolean
  shouldRedirect?: string
  logContext: Record<string, any>
}

export function handleAuthError(
  error: unknown, 
  operation: string,
  context?: Record<string, any>
): AuthErrorResult {
  const timestamp = new Date().toISOString()
  let authError: AuthError
  
  // Convert various error types to AuthError
  if (error instanceof AuthError) {
    authError = error
  } else if (error && typeof error === 'object' && 'message' in error) {
    authError = mapSupabaseAuthError(error)
  } else if (error instanceof Error) {
    authError = new AuthError(error.message)
  } else {
    authError = new AuthError('Unknown authentication error')
  }

  const logContext = {
    ...context,
    operation,
    errorCode: authError.code,
    timestamp,
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined
  }

  // Determine user-friendly message
  const userMessage = getUserFriendlyMessage(authError)
  
  // Determine if operation should be retried
  const shouldRetry = isRetryableError(authError)
  
  // Determine redirect behavior
  let shouldRedirect: string | undefined
  
  switch (authError.code) {
    case ErrorCode.AUTH_SESSION_EXPIRED:
    case ErrorCode.AUTH_TOKEN_INVALID:
      shouldRedirect = '/login'
      break
    case ErrorCode.AUTH_EMAIL_NOT_CONFIRMED:
      shouldRedirect = '/signup-success'
      break
  }

  return {
    error: authError,
    userMessage,
    shouldRetry,
    shouldRedirect,
    logContext
  }
}

// Get user-friendly error messages
export function getUserFriendlyMessage(error: AuthError): string {
  const friendlyMessages: Record<ErrorCode, string> = {
    [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'The email or password you entered is incorrect. Please try again.',
    [ErrorCode.AUTH_USER_NOT_FOUND]: 'No account found with this email address. Would you like to create an account?',
    [ErrorCode.AUTH_EMAIL_NOT_CONFIRMED]: 'Please check your email and click the confirmation link to activate your account.',
    [ErrorCode.AUTH_EMAIL_ALREADY_EXISTS]: 'An account with this email already exists. Please try signing in instead.',
    [ErrorCode.AUTH_WEAK_PASSWORD]: 'Please choose a stronger password with at least 8 characters.',
    [ErrorCode.AUTH_SIGNUP_DISABLED]: 'New account registration is temporarily disabled. Please try again later.',
    [ErrorCode.AUTH_SESSION_EXPIRED]: error.context?.userFriendlyMessage || 'Please sign in to continue.',
    [ErrorCode.AUTH_TOKEN_INVALID]: 'Your authentication token is invalid. Please sign in again.',
    [ErrorCode.AUTH_RATE_LIMITED]: 'Too many attempts. Please wait a few minutes before trying again.',
    [ErrorCode.AUTH_PROFILE_UPDATE_FAILED]: 'Unable to update your profile. Please try again.',
    [ErrorCode.AUTH_PASSWORD_RESET_FAILED]: 'Unable to send password reset email. Please verify your email address.',
    [ErrorCode.AUTH_MAGIC_LINK_FAILED]: 'Unable to send magic link. Please verify your email address.',
    [ErrorCode.AUTHENTICATION_ERROR]: 'Please sign in to access this feature.',
    [ErrorCode.AUTHORIZATION_ERROR]: 'You do not have permission to access this resource.',
    [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
    [ErrorCode.NOT_FOUND]: 'The requested resource was not found.',
    [ErrorCode.EXTERNAL_SERVICE_ERROR]: 'External service temporarily unavailable. Please try again.',
    [ErrorCode.RATE_LIMIT_ERROR]: 'Too many requests. Please slow down.',
    [ErrorCode.INTERNAL_ERROR]: 'An unexpected error occurred. Please try again.',
    [ErrorCode.GPT_SERVICE_ERROR]: 'AI service temporarily unavailable. Please try again.',
    [ErrorCode.IMAGE_PROCESSING_ERROR]: 'Failed to process image. Please try again.',
    [ErrorCode.PARSING_ERROR]: 'Failed to process your request. Please try again.'
  }

  return friendlyMessages[error.code] || 'An unexpected error occurred. Please try again.'
}

// Helper function to determine if an error is actually expected (user not authenticated)
export function isExpectedAuthError(error: unknown): boolean {
  if (!error) return false
  
  const message = (error instanceof Error ? error.message : String(error)).toLowerCase()
  
  return message.includes('session missing') ||
         message.includes('auth session missing') ||
         message.includes('no session found') ||
         message.includes('session not found') ||
         message.includes('no active session') ||
         message.includes('session expired') ||
         message.includes('not authenticated') ||
         message.includes('no user found') ||
         (message.includes('session') && (
           message.includes('invalid') || 
           message.includes('expired') || 
           message.includes('missing')
         ))
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