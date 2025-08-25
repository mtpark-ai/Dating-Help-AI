"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function LoginSuccessContent() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')
  const method = searchParams.get('method') || 'default'
  const hasRedirectDestination = redirectTo && redirectTo !== '/login' && redirectTo !== '/'

  const getMethodMessage = () => {
    switch (method) {
      case 'google':
        return {
          title: 'Welcome back!',
          description: 'You have successfully signed in with Google to Dating Help AI'
        }
      case 'email':
        return {
          title: 'Welcome back!', 
          description: 'You have successfully signed in via email to Dating Help AI'
        }
      default:
        return {
          title: 'Welcome back!',
          description: 'You have successfully signed in to Dating Help AI'
        }
    }
  }

  const messageContent = getMethodMessage()

  return (
    <div className="relative min-h-svh md:min-h-screen"> 
      <div
        className="fixed inset-0 -z-10 bg-gradient-to-br from-pink-50 via-white to-purple-50"
        aria-hidden="true"
      />

      <Header />
      
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="w-full max-w-lg h-[20.8rem] flex flex-col" style={{
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06), 0 8px 16px rgba(0, 0, 0, 0.04)'
        }}>
          
          {/* Header：小屏 pb-8，大屏 pb-12 */}
          <CardHeader className="text-center pb-2 md:pb-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 mb-8 md:mb-10">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-[1.75rem] font-bold text-gray-900">
              {messageContent.title}
            </CardTitle>
          </CardHeader>
          
          {/* Content：小屏 mb-10，大屏 mb-12 */}
          <CardContent className="text-center flex flex-col flex-grow justify-between pb-8 md:pb-12">
            <div>
              <p className="text-gray-600 mb-4 md:mb-6">
                {messageContent.description}
                <br />
                Start exploring our features!
              </p>
            </div>
            
            {hasRedirectDestination ? (
              <div className="space-y-3">
                <Link href={redirectTo}>
                  <Button className="w-2/3 mx-auto bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold transition-colors" size="sm">
                    Continue to App
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-2/3 mx-auto border-pink-200 text-pink-600 hover:bg-pink-50 font-semibold transition-colors" size="sm">
                    Go to Homepage
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/">
                <Button className="w-2/3 mx-auto bg-pink-100 hover:bg-pink-200 text-pink-600 font-semibold transition-colors mt-auto" size="sm">
                  Go to Homepage
                </Button>
              </Link>
            )}
          </CardContent>

        </Card>
      </div>
    </div>
  )
}

export default function LoginSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginSuccessContent />
    </Suspense>
  )
}
