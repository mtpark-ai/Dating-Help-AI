"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import Header from "@/components/header"
import { Heart } from "lucide-react"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const { signInWithGoogle, sendMagicLink } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleGoogleSignIn = async () => {
    console.log('handleGoogleSignIn')
    debugger;
    setIsGoogleLoading(true)
    try {
      console.log('handleGoogleSignIn')
      const { error } = await signInWithGoogle()
      
      if (error) {
        toast({
          title: "Google Sign In Failed",
          description: error.message || "Unable to connect with Google. Please try again.",
          variant: "destructive",
        })
      }
      // Note: For OAuth, the user will be redirected to Google, so no success handling here
    } catch (error) {
      console.error('Google sign in error:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      const { error } = await sendMagicLink(email)
      
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to send verification email. Please try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Check Your Email",
          description: "We've sent you a magic link to sign in. Check your inbox!",
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Email sign in error:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-svh md:min-h-screen bg-transparent flex flex-col overflow-hidden">
      <div
        className="fixed inset-0 -z-10 bg-gradient-to-br from-pink-50 via-white to-purple-50"
        aria-hidden="true"
      />
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex items-center justify-center flex-1">
        <div className="w-full max-w-md">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Hey, let's get started!
            </h1>
            <p className="text-lg text-gray-600 flex items-center justify-center gap-2">
              <span>👋</span>
              <span>Welcome to Dating Help AI, please login to continue.</span>
            </p>
          </div>

          {/* Google Sign In - Primary CTA */}
          <div className="mb-8">
            <Button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full h-14 text-base font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm rounded-xl transition-all duration-200"
            >
              {isGoogleLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <span>Connecting with Google...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </div>
              )}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-pink-50 via-white to-purple-50 text-gray-500 font-medium">
                OR
              </span>
            </div>
          </div>

          {/* Email Magic Link */}
          <form onSubmit={handleEmailSignIn} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-base font-medium text-gray-900 mb-3">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full h-12 text-base rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-0 bg-white"
              />
            </div>
            
            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-12 text-base font-medium rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 border-0 transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <span>Sending verification code...</span>
                </div>
              ) : (
                "Send Verification Code"
              )}
            </Button>
          </form>

          {/* Terms and Privacy */}
          <p className="mt-8 text-sm text-center text-gray-500">
            By logging in, you agree to our{" "}
            <Link href="/terms" className="text-purple-600 hover:text-purple-700 font-medium">
              Terms of Service
            </Link>
            {" "}&{" "}
            <Link href="/privacy" className="text-purple-600 hover:text-purple-700 font-medium">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}