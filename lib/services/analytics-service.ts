import { BaseService } from './base-service'
import { createServerSupabaseClient } from '../supabase-server'
import type { UsageStats } from '../../types'

export interface AnalyticsEvent {
  eventType: 'page_view' | 'feature_used' | 'conversion' | 'error'
  eventData: Record<string, any>
  timestamp?: Date
}

export interface FeatureMetrics {
  totalUsage: number
  uniqueUsers: number
  averageSessionDuration: number
  conversionRate: number
}

export interface PerformanceReport {
  averageResponseTime: number
  errorRate: number
  activeUsers: number
  topFeatures: string[]
}

export class AnalyticsService extends BaseService {
  constructor() {
    super('AnalyticsService')
  }

  async trackUserEvent(userId: string, event: AnalyticsEvent): Promise<{ success: boolean }> {
    return this.handleServiceError('trackUserEvent', async () => {
      const supabase = createServerSupabaseClient()

      // Store event in user_feedback table with general type for analytics
      const eventRecord = {
        user_id: userId,
        related_entity_type: 'general' as const,
        rating: 5, // Default neutral rating for analytics events
        feedback: `Analytics: ${event.eventType}`,
        feedback_type: 'quality' as const,
        metadata: {
          eventType: event.eventType,
          eventData: event.eventData,
          timestamp: event.timestamp || new Date()
        },
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('user_feedback')
        .insert([eventRecord])

      if (error) {
        throw error
      }

      this.log('debug', 'Analytics event tracked', {
        userId,
        eventType: event.eventType,
        eventData: event.eventData
      })

      return { success: true }
    })
  }

  async getUserUsageStats(userId: string): Promise<UsageStats> {
    return this.handleServiceError('getUserUsageStats', async () => {
      const supabase = createServerSupabaseClient()

      const { data, error } = await supabase
        .from('user_profiles')
        .select('usage_stats')
        .eq('id', userId)
        .single()

      if (error) {
        throw error
      }

      return data.usage_stats as UsageStats
    })
  }

  async getFeatureMetrics(feature: string, timeRange: { start: Date; end: Date }): Promise<FeatureMetrics> {
    return this.handleServiceError('getFeatureMetrics', async () => {
      const supabase = createServerSupabaseClient()

      // Query analytics events for the feature within time range
      const { data, error } = await supabase
        .from('user_feedback')
        .select('user_id, metadata, created_at')
        .eq('related_entity_type', 'general')
        .gte('created_at', timeRange.start.toISOString())
        .lte('created_at', timeRange.end.toISOString())

      if (error) {
        throw error
      }

      // Filter for specific feature events
      const featureEvents = data?.filter(event => {
        const metadata = event.metadata as any
        return metadata?.eventData?.feature === feature
      }) || []

      const uniqueUsers = new Set(featureEvents.map(e => e.user_id)).size
      const totalUsage = featureEvents.length

      // Calculate average session duration (simplified)
      const averageSessionDuration = featureEvents.reduce((acc, event) => {
        const metadata = event.metadata as any
        return acc + (metadata?.eventData?.duration || 0)
      }, 0) / featureEvents.length || 0

      // Placeholder conversion rate calculation
      const conversionRate = 0.15 // 15% default

      return {
        totalUsage,
        uniqueUsers,
        averageSessionDuration,
        conversionRate
      }
    })
  }

  async generatePerformanceReport(): Promise<PerformanceReport> {
    return this.handleServiceError('generatePerformanceReport', async () => {
      const supabase = createServerSupabaseClient()

      // Get recent activity data
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: recentActivity, error } = await supabase
        .from('user_feedback')
        .select('user_id, metadata, created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())

      if (error) {
        throw error
      }

      // Calculate metrics
      const uniqueUsers = new Set(recentActivity?.map(a => a.user_id) || []).size
      
      // Extract performance data from metadata
      const performanceEvents = recentActivity?.filter(event => {
        const metadata = event.metadata as any
        return metadata?.duration || metadata?.responseTime
      }) || []

      const averageResponseTime = performanceEvents.reduce((acc, event) => {
        const metadata = event.metadata as any
        return acc + (metadata?.responseTime || metadata?.duration || 0)
      }, 0) / performanceEvents.length || 0

      // Calculate error rate
      const errorEvents = recentActivity?.filter(event => {
        const metadata = event.metadata as any
        return metadata?.eventType === 'error'
      }) || []

      const errorRate = errorEvents.length / (recentActivity?.length || 1)

      // Get top features
      const featureUsage = new Map<string, number>()
      recentActivity?.forEach(event => {
        const metadata = event.metadata as any
        const feature = metadata?.eventData?.feature
        if (feature) {
          featureUsage.set(feature, (featureUsage.get(feature) || 0) + 1)
        }
      })

      const topFeatures = Array.from(featureUsage.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([feature]) => feature)

      return {
        averageResponseTime,
        errorRate,
        activeUsers: uniqueUsers,
        topFeatures
      }
    })
  }

  async trackConversion(userId: string, conversionType: string): Promise<{ success: boolean }> {
    return this.handleServiceError('trackConversion', async () => {
      return await this.trackUserEvent(userId, {
        eventType: 'conversion',
        eventData: {
          conversionType,
          timestamp: new Date()
        }
      })
    })
  }

  async trackError(userId: string, error: Error, context?: Record<string, any>): Promise<{ success: boolean }> {
    return this.handleServiceError('trackError', async () => {
      return await this.trackUserEvent(userId, {
        eventType: 'error',
        eventData: {
          errorMessage: error.message,
          errorStack: error.stack,
          context: context || {}
        }
      })
    })
  }

  async getActiveUserCount(timeRange: { start: Date; end: Date }): Promise<number> {
    return this.handleServiceError('getActiveUserCount', async () => {
      const supabase = createServerSupabaseClient()

      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .gte('last_active_at', timeRange.start.toISOString())
        .lte('last_active_at', timeRange.end.toISOString())

      if (error) {
        throw error
      }

      return data?.length || 0
    })
  }

  async getDailyActiveUsers(): Promise<number> {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    return this.getActiveUserCount({ start: yesterday, end: today })
  }

  async getWeeklyActiveUsers(): Promise<number> {
    const today = new Date()
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    return this.getActiveUserCount({ start: weekAgo, end: today })
  }
}

export const analyticsService = new AnalyticsService()