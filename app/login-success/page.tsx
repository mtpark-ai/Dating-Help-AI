"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"

export default function LoginSuccessPage() {
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
              Welcome back !
            </CardTitle>
          </CardHeader>
          
          {/* Content：小屏 mb-10，大屏 mb-12 */}
          <CardContent className="text-center flex flex-col flex-grow justify-between pb-8 md:pb-12">
            <div>
              <p className="text-gray-600 mb-4 md:mb-6">
                You have successfully signed in to Dating Help AI
                <br />
                Start exploring our features!
              </p>
            </div>
            
            <Link href="/">
              <Button className="w-2/3 mx-auto bg-pink-100 hover:bg-pink-200 text-pink-600 font-semibold transition-colors mt-auto" size="sm">
                Go to Homepage
              </Button>
            </Link>
          </CardContent>

        </Card>
      </div>
    </div>
  )
}
