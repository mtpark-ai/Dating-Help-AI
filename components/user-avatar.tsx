'use client'

import { User } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function UserAvatar({ size = 'md', className = '' }: UserAvatarProps) {
  const { user } = useAuth()

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  if (!user) {
    // 未登录时显示空白人像
    return (
      <div className={`${sizeClasses[size]} bg-gray-200 rounded-full flex items-center justify-center ${className}`}>
        <User className={`${iconSizes[size]} text-gray-500`} />
      </div>
    )
  }

  // 已登录时显示用户名字首字母
  const getInitials = (email: string) => {
    // 从邮箱中提取用户名部分（@符号前的部分）
    const username = email.split('@')[0]
    
    // 如果用户名包含点号或下划线，取第一个部分
    const firstPart = username.split(/[._-]/)[0]
    
    // 返回首字母，转换为大写
    return firstPart.charAt(0).toUpperCase()
  }

  const initials = getInitials(user.email || '')

  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold ${className}`}>
      {initials}
    </div>
  )
}
