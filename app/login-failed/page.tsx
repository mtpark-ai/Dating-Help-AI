"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"

export default function LoginFailedPage() {
  return (
    <div className="relative min-h-svh md:min-h-screen">
      <div
        className="fixed inset-0 -z-10 bg-gradient-to-br from-pink-50 via-white to-purple-50"
        aria-hidden="true"
      />

      <Header />

      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Card
          className="w-full max-w-lg h-[20.8rem] flex flex-col"
          style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06), 0 8px 16px rgba(0, 0, 0, 0.04)' }}
        >

          {/* Header：小屏更紧凑，大屏稍微留白 */}
          <CardHeader className="text-center pb-2 md:pb-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 mb-8 md:mb-10">
              <XCircle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-[1.75rem] font-bold text-gray-900">
              Oops, we couldn't log you in
            </CardTitle>
          </CardHeader>

          {/* Content：响应式间距 */}
          <CardContent className="text-center flex flex-col flex-grow justify-between pb-8 md:pb-12">
            <div>
              <p className="text-gray-600 mb-4 md:mb-6">
                Please check your email and password,<br />
                or try signing up if you don't have an account.
              </p>
            </div>

            {/* 按钮组：并排小按钮 */}
            <div className="flex gap-4 mt-auto">
              <Link href="/login" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold" size="sm">
                  Try Again
                </Button>
              </Link>

              <Link href="/login?mode=signup" className="flex-1">
                <Button className="w-full bg-pink-100 hover:bg-pink-200 text-pink-600 transition-colors font-semibold" size="sm">
                  Sign Up Instead
                </Button>
              </Link>
            </div>
          </CardContent>

        </Card>
      </div>
    </div>
  )
}
