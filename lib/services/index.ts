// Dating Help AI Service Layer
// Centralized export for all services in the modular architecture

// Base service class
export { BaseService } from './base-service'

// Core services
export { AIService, aiService } from './ai-service'
export { UserService, userService } from './user-service'
export { ConversationService, conversationService } from './conversation-service'
export { PickupLineService, pickupLineService } from './pickup-line-service'
export { ScreenshotService, screenshotService } from './screenshot-service'
export { CacheService, cacheService } from './cache-service'
export { AnalyticsService, analyticsService } from './analytics-service'

// Service testing utilities
export { testServiceArchitecture, serviceHealthCheck } from './test-services'

// Type definitions for service requests
export type {
  GeneratePickupLineRequest,
  PickupLineHistoryFilters
} from './pickup-line-service'

export type {
  ScreenshotHistoryFilters
} from './screenshot-service'

export type {
  CreateConversationData
} from './conversation-service'

export type {
  CacheType,
  CacheOptions
} from './cache-service'

export type {
  AnalyticsEvent,
  FeatureMetrics,
  PerformanceReport
} from './analytics-service'

// Lazy service collection to avoid circular imports
export const services = {
  get ai() { return aiService },
  get user() { return userService },
  get conversation() { return conversationService },
  get pickupLine() { return pickupLineService },
  get screenshot() { return screenshotService },
  get cache() { return cacheService },
  get analytics() { return analyticsService }
} as const

// Service health check function
export const checkServicesHealth = async () => {
  const healthStatus = {
    timestamp: new Date().toISOString(),
    services: {} as Record<string, boolean>,
    overall: true
  }

  for (const [name, service] of Object.entries(services)) {
    try {
      // Basic service availability check
      healthStatus.services[name] = !!service && typeof service === 'object'
    } catch (error) {
      healthStatus.services[name] = false
      healthStatus.overall = false
    }
  }

  return healthStatus
}

// Service initialization check
export const ensureServicesInitialized = () => {
  const requiredServices = ['ai', 'user', 'conversation', 'cache', 'analytics'] as const
  const missing: string[] = []

  for (const serviceName of requiredServices) {
    if (!services[serviceName]) {
      missing.push(serviceName)
    }
  }

  if (missing.length > 0) {
    throw new Error(`Required services not initialized: ${missing.join(', ')}`)
  }

  return true
}

// Version information
export const SERVICE_LAYER_VERSION = '1.0.0'
export const ARCHITECTURE_VERSION = '1.0.0'