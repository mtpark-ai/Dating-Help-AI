"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import Header from "@/components/header"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const { signIn, signUp } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  // 检查 URL 参数来决定显示登录还是注册界面
  useEffect(() => {
    const mode = searchParams.get('mode')
    if (mode === 'signup') {
      setIsSignUp(true)
    } else {
      setIsSignUp(false)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    console.log('Form submitted:', { isSignUp, email, password, rememberMe })

    try {
      if (isSignUp) {
        // 注册模式
        console.log('Starting signup process for:', email)
        const { data, error, autoLoginAttempted } = await signUp(email, password)
        
        console.log('Signup result:', { data, error, autoLoginAttempted })
        
        if (error) {
          console.error('Signup error:', error)
          
          if (autoLoginAttempted) {
            // 自动登录失败，跳转到登录失败页面
            console.log('Auto login failed, redirecting to login-failed')
            router.push("/login-failed")
          } else {
            // 其他注册错误，跳转到注册失败页面
            console.log('Other signup error, redirecting to signup-failed')
            router.push("/signup-failed")
          }
        } else {
          if (autoLoginAttempted) {
            // 自动登录成功，跳转到登录成功页面
            console.log('Auto login successful, redirecting to login-success')
            router.push("/login-success")
          } else {
            // 新用户注册成功，跳转到注册成功页面
            console.log('New user signup successful, redirecting to signup-success')
            router.push("/signup-success")
          }
        }
      } else {
        // 登录模式 - 先尝试登录
        const { data, error } = await signIn(email, password, rememberMe)
        
        if (error) {
          console.error('Signin error:', error)
          
          // 如果登录失败，检查是否是用户不存在
          const errorMessage = error && typeof error === 'object' && 'message' in error 
            ? String(error.message) 
            : '';
          
          // 检查是否是用户不存在的错误
          if (errorMessage.includes('Invalid login credentials') || 
              errorMessage.includes('User not found') ||
              errorMessage.includes('Email not confirmed') ||
              errorMessage.includes('Invalid email or password')) {
            
            // 尝试自动注册
            const signupResult = await signUp(email, password)
            
            if (signupResult.error) {
              console.error('Auto signup failed:', signupResult.error)
              router.push("/login-failed")
            } else {
              // 自动注册成功，跳转到注册成功页面
              router.push("/signup-success")
            }
          } else {
            router.push("/login-failed")
          }
        } else {
          // 登录成功
          router.push("/login-success")
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-svh md:min-h-screen bg-transparent flex flex-col overflow-hidden landing-page-zoom">
      <div
        className="fixed inset-0 -z-10 bg-gradient-to-br from-pink-50 via-white to-purple-50"
        aria-hidden="true"
      />
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <p className="text-gray-600">
              {isSignUp 
                ? "Sign up to get started with Dating Help AI"
                : "Sign in to continue to Dating Help AI"
              }
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full"
                />
              </div>
              
              {!isSignUp && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-0"
                  />
                  <label htmlFor="rememberMe" className="text-sm text-gray-700 cursor-pointer">
                    Remember me
                  </label>
                </div>
              )}
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  isSignUp ? "Create Account" : "Sign In"
                )}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                {isSignUp 
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>
            
            {!isSignUp && (
              <div className="mt-2 text-center">
                <Link 
                  href="/forgot-password"
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                  Forgot your password?
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
} 