import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 创建类型安全的前端客户端
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 自动刷新 token
    autoRefreshToken: true,
    // 持久化会话
    persistSession: true,
    // 检测会话变化
    detectSessionInUrl: true,
    // 添加更多会话管理选项
    flowType: 'pkce',
    // 确保在页面加载时检查 URL 中的会话信息
    onAuthStateChange: (event, session) => {
      // 当认证状态改变时，确保会话被正确设置
      if (event === 'SIGNED_IN' && session) {
        // 可以在这里添加额外的会话处理逻辑
        console.log('User signed in:', session.user.email)
      } else if (event === 'SIGNED_UP' && session) {
        // 用户注册成功
        console.log('User signed up:', session.user.email)
      } else if (event === 'USER_UPDATED') {
        // 用户信息更新（比如邮箱确认）
        console.log('User updated:', session?.user?.email)
      }
    }
  },
  // 实时订阅配置
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// 导出类型
export type { User } from '@supabase/supabase-js'
export type { Database } 