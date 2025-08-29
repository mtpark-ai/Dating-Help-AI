'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useAuthLoading } from '@/hooks/use-auth-loading'
import type { UseLoadingReturn } from '@/types/loading'

// Create the context
const AuthLoadingContext = createContext<UseLoadingReturn | undefined>(undefined)

// Provider component
export function AuthLoadingProvider({ children }: { children: ReactNode }) {
  const authLoading = useAuthLoading()

  return (
    <AuthLoadingContext.Provider value={authLoading}>
      {children}
    </AuthLoadingContext.Provider>
  )
}

// Hook to use the context
export function useAuthLoadingContext(): UseLoadingReturn {
  const context = useContext(AuthLoadingContext)
  
  if (!context) {
    throw new Error('useAuthLoadingContext must be used within an AuthLoadingProvider')
  }
  
  return context
}

// Optional: HOC for components that need loading context
export function withAuthLoading<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AuthLoadingWrappedComponent(props: P) {
    return (
      <AuthLoadingProvider>
        <Component {...props} />
      </AuthLoadingProvider>
    )
  }
}