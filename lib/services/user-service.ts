import { BaseService } from './base-service'
import { createServerSupabaseClient } from '../supabase-server'
import type { User, UserPreferences, UsageStats } from '../../types'

export class UserService extends BaseService {
  constructor() {
    super('UserService')
  }

  async getProfile(userId: string): Promise<User | null> {
    return this.handleServiceError('getProfile', async () => {
      const supabase = createServerSupabaseClient()
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null
        }
        throw error
      }

      return data
    })
  }

  async getOrCreateProfile(userId: string, email: string): Promise<User> {
    return this.handleServiceError('getOrCreateProfile', async () => {
      let profile = await this.getProfile(userId)
      
      if (!profile) {
        profile = await this.createProfile(userId, email)
      } else {
        // Update last active timestamp
        await this.updateLastActive(userId)
      }

      return profile
    })
  }

  async createProfile(userId: string, email: string): Promise<User> {
    return this.handleServiceError('createProfile', async () => {
      const supabase = createServerSupabaseClient()
      
      const newProfile = {
        id: userId,
        email,
        created_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
        preferences: {
          defaultTone: 'casual',
          preferredLanguage: 'en',
          contentFiltering: true,
          analyticsOptIn: true
        },
        usage_stats: {
          totalConversations: 0,
          totalPickupLines: 0,
          totalScreenshots: 0,
          dailyUsage: 0,
          lastResetDate: new Date().toISOString(),
          tierLevel: 'free'
        },
        metadata: {}
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .insert([newProfile])
        .select()
        .single()

      if (error) {
        throw error
      }

      this.log('info', 'New user profile created', { userId, email })
      return data
    })
  }

  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    return this.handleServiceError('updatePreferences', async () => {
      const supabase = createServerSupabaseClient()
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ preferences })
        .eq('id', userId)

      if (error) {
        throw error
      }

      this.log('debug', 'User preferences updated', { userId, preferences })
    })
  }

  async updateUsageStats(userId: string, action: 'conversation' | 'pickupLine' | 'screenshot'): Promise<void> {
    return this.handleServiceError('updateUsageStats', async () => {
      const supabase = createServerSupabaseClient()
      
      // Get current stats
      const { data: profile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('usage_stats')
        .eq('id', userId)
        .single()

      if (fetchError) {
        throw fetchError
      }

      const currentStats = profile.usage_stats as UsageStats
      const today = new Date().toISOString().split('T')[0]
      const lastResetDate = currentStats.lastResetDate?.split('T')[0]

      // Reset daily usage if it's a new day
      let dailyUsage = currentStats.dailyUsage
      if (lastResetDate !== today) {
        dailyUsage = 0
      }

      // Update stats based on action
      const updatedStats: UsageStats = {
        ...currentStats,
        dailyUsage: dailyUsage + 1,
        lastResetDate: new Date().toISOString()
      }

      switch (action) {
        case 'conversation':
          updatedStats.totalConversations = (currentStats.totalConversations || 0) + 1
          break
        case 'pickupLine':
          updatedStats.totalPickupLines = (currentStats.totalPickupLines || 0) + 1
          break
        case 'screenshot':
          updatedStats.totalScreenshots = (currentStats.totalScreenshots || 0) + 1
          break
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ usage_stats: updatedStats })
        .eq('id', userId)

      if (error) {
        throw error
      }

      this.log('debug', 'Usage stats updated', { userId, action, newDailyUsage: updatedStats.dailyUsage })
    })
  }

  async checkRateLimits(userId: string, action: string): Promise<boolean> {
    return this.handleServiceError('checkRateLimits', async () => {
      const profile = await this.getProfile(userId)
      
      if (!profile) {
        return false
      }

      const usageStats = profile.usage_stats as UsageStats
      const tierLevel = usageStats.tierLevel || 'free'
      
      // Define rate limits by tier
      const rateLimits = {
        free: {
          dailyConversations: 10,
          dailyPickupLines: 5,
          dailyScreenshots: 3,
          totalDaily: 20
        },
        premium: {
          dailyConversations: 100,
          dailyPickupLines: 50,
          dailyScreenshots: 30,
          totalDaily: 200
        }
      }

      const limits = rateLimits[tierLevel as keyof typeof rateLimits] || rateLimits.free
      const currentDailyUsage = usageStats.dailyUsage || 0

      // Check if under daily limit
      const isUnderLimit = currentDailyUsage < limits.totalDaily

      if (!isUnderLimit) {
        this.log('warn', 'Rate limit exceeded', { userId, action, currentDailyUsage, limit: limits.totalDaily })
      }

      return isUnderLimit
    })
  }

  async updateLastActive(userId: string): Promise<void> {
    return this.handleServiceError('updateLastActive', async () => {
      const supabase = createServerSupabaseClient()
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) {
        throw error
      }
    })
  }

  async deleteAccount(userId: string): Promise<void> {
    return this.handleServiceError('deleteAccount', async () => {
      const supabase = createServerSupabaseClient()
      
      // Delete user profile (cascading deletes will handle related data)
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId)

      if (error) {
        throw error
      }

      // Delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)
      
      if (authError) {
        throw authError
      }

      this.log('info', 'User account deleted', { userId })
    })
  }
}

export const userService = new UserService()