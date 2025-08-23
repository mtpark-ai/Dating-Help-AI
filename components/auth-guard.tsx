"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { LoadingPage } from "@/components/ui/loading-overlay"
import type { AuthGuardProps } from "@/types/auth"

export default function AuthGuard({ 
  children, 
  fallback, 
  redirectTo = "/login",
  requireProfile = false 
}: AuthGuardProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, loading, router, redirectTo])

  if (loading) {
    return (
      fallback || (
        <LoadingPage
          title="Authenticating"
          message="Please wait while we verify your session..."
        />
      )
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
} 