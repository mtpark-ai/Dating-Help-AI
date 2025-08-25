'use client'

import { User, ChevronDown } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useState } from 'react'
import Image from 'next/image'

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showDropdown?: boolean
  onSignOut?: () => void
}

export function UserAvatar({ 
  size = 'md', 
  className = '', 
  showDropdown = false,
  onSignOut 
}: UserAvatarProps) {
  const { user, signOut } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [imageError, setImageError] = useState(false)

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

  const handleSignOut = async () => {
    await signOut()
    setIsDropdownOpen(false)
    if (onSignOut) {
      onSignOut()
    }
  }

  if (!user) {
    // 未登录时显示空白人像
    return (
      <div className={`${sizeClasses[size]} bg-gray-200 rounded-full flex items-center justify-center ${className}`}>
        <User className={`${iconSizes[size]} text-gray-500`} />
      </div>
    )
  }

  // 获取用户头像URL（优先Google头像）
  const getAvatarUrl = () => {
    // Try to get Google avatar from user metadata
    if (user.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url
    }
    
    // Try to get from user identities (Google OAuth)
    if (user.identities && user.identities.length > 0) {
      const googleIdentity = user.identities.find(identity => identity.provider === 'google')
      if (googleIdentity && googleIdentity.identity_data?.picture) {
        return googleIdentity.identity_data.picture
      }
    }

    return null
  }

  // 获取用户显示名称
  const getDisplayName = () => {
    // Try to get name from Google
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    
    if (user.identities && user.identities.length > 0) {
      const googleIdentity = user.identities.find(identity => identity.provider === 'google')
      if (googleIdentity && googleIdentity.identity_data?.name) {
        return googleIdentity.identity_data.name
      }
    }

    // Fallback to email
    return user.email || 'User'
  }

  // 获取用户名字首字母作为fallback
  const getInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  const avatarUrl = getAvatarUrl()
  const displayName = getDisplayName()
  const initials = getInitials(displayName)

  const avatarContent = (
    <div className={`relative ${showDropdown ? 'cursor-pointer' : ''}`}>
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-semibold ${className}`}>
        {avatarUrl && !imageError ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
            height={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {showDropdown && (
        <ChevronDown className="absolute -right-1 -bottom-1 w-3 h-3 text-gray-400" />
      )}
    </div>
  )

  if (!showDropdown) {
    return avatarContent
  }

  return (
    <div className="relative">
      <div 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2"
      >
        {avatarContent}
      </div>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
