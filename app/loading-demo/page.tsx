'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingButton, AuthLoadingButton } from '@/components/ui/loading-button'
import { LoadingIndicator, Spinner, LoadingDots } from '@/components/ui/loading-spinner'
import { LoadingOverlay, AuthLoadingOverlay } from '@/components/ui/loading-overlay'
import { useAuthLoading, useAsyncOperation } from '@/hooks/use-auth-loading'
import { AuthLoadingProvider } from '@/contexts/auth-loading-context'

function LoadingDemoContent() {
  const [showOverlay, setShowOverlay] = useState(false)
  const [showAuthOverlay, setShowAuthOverlay] = useState(false)
  const [progress, setProgress] = useState(0)
  
  const authLoading = useAuthLoading()
  const signInOperation = useAsyncOperation('signIn')
  const signUpOperation = useAsyncOperation('signUp')

  const simulateAuth = async (operation: 'signIn' | 'signUp') => {
    const op = operation === 'signIn' ? signInOperation : signUpOperation
    
    await op.executeWithLoading(async () => {
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        op.updateProgress(i, `${operation === 'signIn' ? 'Signing in' : 'Creating account'}... ${i}%`)
      }
    })
  }

  const showProgressOverlay = async () => {
    setShowOverlay(true)
    authLoading.startLoading('updateProfile', 'Processing...')
    
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setProgress(i)
      authLoading.updateProgress('updateProfile', i, `Processing... ${i}%`)
    }
    
    authLoading.finishLoading('updateProfile')
    setShowOverlay(false)
    setProgress(0)
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-4xl font-bold text-center">Loading State Demo</h1>
      
      {/* Loading Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Loading Indicators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Spinners</h3>
              <div className="flex items-center space-x-4">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Loading Dots</h3>
              <div className="flex items-center space-x-4">
                <LoadingDots size="sm" />
                <LoadingDots size="md" />
                <LoadingDots size="lg" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">With Messages</h3>
              <LoadingIndicator 
                variant="spinner" 
                size="md" 
                showMessage={true}
                message="Loading your data..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Loading Buttons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <LoadingButton
              isLoading={signInOperation.isLoading}
              onClick={() => simulateAuth('signIn')}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Basic Loading Button
            </LoadingButton>
            
            <AuthLoadingButton
              operation="signUp"
              isLoading={signUpOperation.isLoading}
              onClick={() => simulateAuth('signUp')}
              className="bg-green-500 hover:bg-green-600"
            >
              Auth Loading Button
            </AuthLoadingButton>
            
            <LoadingButton
              isLoading={authLoading.isOperationLoading('resetPassword')}
              onClick={() => {
                authLoading.startLoading('resetPassword')
                setTimeout(() => authLoading.finishLoading('resetPassword'), 3000)
              }}
              variant="outline"
            >
              Reset Password
            </LoadingButton>
          </div>
        </CardContent>
      </Card>

      {/* Operation States */}
      <Card>
        <CardHeader>
          <CardTitle>Current Loading States</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Global Loading:</strong> {authLoading.loadingStates.globalLoading ? 'Yes' : 'No'}</p>
            <p><strong>Active Operations:</strong> {authLoading.loadingStates.operationQueue.join(', ') || 'None'}</p>
            <div className="mt-4">
              <strong>Individual States:</strong>
              <ul className="mt-2 space-y-1">
                {Object.entries(authLoading.loadingStates.states).map(([operation, state]) => (
                  <li key={operation} className="ml-4">
                    • {operation}: {state.message} 
                    {state.progress !== undefined && ` (${state.progress}%)`}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading Overlays */}
      <Card>
        <CardHeader>
          <CardTitle>Loading Overlays</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => setShowAuthOverlay(true)}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Show Auth Overlay
            </Button>
            
            <Button
              onClick={showProgressOverlay}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Show Progress Overlay
            </Button>
            
            <Button
              onClick={() => {
                authLoading.startLoading('signOut', 'Signing you out...')
                setTimeout(() => authLoading.finishLoading('signOut'), 2000)
              }}
              variant="destructive"
            >
              Simulate Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clear All Button */}
      <div className="text-center">
        <Button
          onClick={() => authLoading.clearAll()}
          variant="outline"
          className="border-red-500 text-red-500 hover:bg-red-50"
        >
          Clear All Loading States
        </Button>
      </div>

      {/* Overlays */}
      <AuthLoadingOverlay
        isVisible={showAuthOverlay}
        operation="signIn"
        variant="modal"
        showCancel={true}
        onCancel={() => setShowAuthOverlay(false)}
      />
      
      <LoadingOverlay
        isVisible={showOverlay}
        message={authLoading.getCurrentMessage('updateProfile')}
        progress={progress}
        variant="modal"
      />
    </div>
  )
}

export default function LoadingDemoPage() {
  return (
    <AuthLoadingProvider>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <LoadingDemoContent />
      </div>
    </AuthLoadingProvider>
  )
}