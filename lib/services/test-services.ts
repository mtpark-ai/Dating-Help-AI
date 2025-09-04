// Test file to verify our service architecture
import { aiService } from './ai-service'
import { userService } from './user-service'
import { conversationService } from './conversation-service'
import { cacheService } from './cache-service'
import { analyticsService } from './analytics-service'

export async function testServiceArchitecture() {
  console.log('🏗️  Testing Dating Help AI Modular Architecture...')
  
  try {
    // Test cache service
    console.log('📦 Testing Cache Service...')
    await cacheService.set('test-key', { message: 'Architecture test successful' }, { ttl: 60 })
    const cachedValue = await cacheService.get('test-key')
    console.log('✅ Cache Service:', cachedValue ? 'Working' : 'Failed')
    
    // Test service initialization
    console.log('🔧 Testing Service Initialization...')
    const services = {
      'AI Service': aiService,
      'User Service': userService,
      'Conversation Service': conversationService,
      'Analytics Service': analyticsService,
    }
    
    for (const [name, service] of Object.entries(services)) {
      if (service && typeof service === 'object') {
        console.log(`✅ ${name}: Initialized`)
      } else {
        console.log(`❌ ${name}: Failed to initialize`)
      }
    }
    
    console.log('🎉 Modular architecture test completed!')
    return true
    
  } catch (error) {
    console.error('❌ Service architecture test failed:', error)
    return false
  }
}

// Export for use in API routes or components
export const serviceHealthCheck = {
  cache: () => cacheService.getStats(),
  services: () => ({
    aiService: !!aiService,
    userService: !!userService,
    conversationService: !!conversationService,
    analyticsService: !!analyticsService,
  })
}