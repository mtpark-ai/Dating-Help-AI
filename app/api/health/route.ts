import { NextResponse } from 'next/server'
import { serviceHealthCheck, testServiceArchitecture } from '@/lib/services/test-services'

export async function GET() {
  try {
    // Run architecture test
    const testResult = await testServiceArchitecture()
    
    // Get service health status
    const healthStatus = {
      timestamp: new Date().toISOString(),
      status: testResult ? 'healthy' : 'unhealthy',
      services: serviceHealthCheck.services(),
      cache: serviceHealthCheck.cache(),
      architecture: {
        modular: true,
        version: '1.0.0',
        components: [
          'AI Service',
          'User Service', 
          'Conversation Service',
          'Cache Service',
          'Analytics Service'
        ]
      }
    }
    
    return NextResponse.json(healthStatus, {
      status: testResult ? 200 : 500
    })
    
  } catch (error) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 500
    })
  }
}