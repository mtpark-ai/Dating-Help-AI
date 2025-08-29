'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X } from 'lucide-react'
import { LoadingButton } from '@/components/ui/loading-button'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onResetCount?: () => void
}

export function SignupModal({ isOpen, onClose, onResetCount }: SignupModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(true) // 控制显示注册还是登录界面
  const { signUp, signIn } = useAuth()
  const { toast } = useToast()

  const handleClose = () => {
    // 重置计数并关闭弹窗
    if (onResetCount) {
      onResetCount()
    }
    // 重置表单状态
    setEmail('')
    setPassword('')
    setIsSignUp(true)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isSignUp) {
        // 注册模式
        const { data, error, autoLoginAttempted } = await signUp(email, password)
        
        if (error) {
          if (autoLoginAttempted) {
            toast({
              description: "Login successful! Welcome back!",
              duration: 3000,
              className: "fixed bottom-4 right-4 bg-green-50 border border-green-200 shadow-lg rounded-lg p-3 w-auto max-w-[280px]",
            })
            handleClose()
          } else {
            toast({
              description: (error as any)?.message || "Signup failed. Please try again.",
              duration: 3000,
              className: "fixed bottom-4 right-4 bg-red-50 border border-red-200 shadow-lg rounded-lg p-3 w-auto max-w-[280px]",
            })
          }
        } else {
          toast({
            description: "Account created successfully! Please check your email.",
            duration: 3000,
            className: "fixed bottom-4 right-4 bg-green-50 border border-green-200 shadow-lg rounded-lg p-3 w-auto max-w-[280px]",
          })
          handleClose()
        }
      } else {
        // 登录模式
        const { data, error } = await signIn(email, password, false)
        
        if (error) {
          toast({
            description: (error as any)?.message || "Login failed. Please try again.",
            duration: 3000,
            className: "fixed bottom-4 right-4 bg-red-50 border border-red-200 shadow-lg rounded-lg p-3 w-auto max-w-[280px]",
          })
        } else {
          toast({
            description: "Login successful! Welcome back!",
            duration: 3000,
            className: "fixed bottom-4 right-4 bg-green-50 border border-green-200 shadow-lg rounded-lg p-3 w-auto max-w-[280px]",
          })
          handleClose()
        }
      }
    } catch (error) {
      toast({
        description: "An unexpected error occurred. Please try again.",
        duration: 3000,
        className: "fixed bottom-4 right-4 bg-red-50 border border-red-200 shadow-lg rounded-lg p-3 w-auto max-w-[280px]",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl border-0 rounded-2xl relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <p className="text-gray-600 text-sm">
            {isSignUp 
              ? "Sign up to get started with Dating Help AI"
              : "Sign in to continue to Dating Help AI"
            }
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="modal-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                id="modal-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full"
              />
            </div>
            
            <div>
              <label htmlFor="modal-password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                id="modal-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full"
              />
            </div>
            
            <LoadingButton
              type="submit"
              isLoading={isLoading}
              operation={isSignUp ? 'signUp' : 'signIn'}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              {isSignUp ? "Create Account" : "Sign In"}
            </LoadingButton>
          </form>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              {isSignUp 
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
