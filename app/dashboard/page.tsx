"use client"

import AuthGuard from "@/components/auth-guard"
import Header from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Welcome Back!</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Hello! Ready to improve your dating game?
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a 
                    href="/upload-screenshot" 
                    className="block p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    📸 Upload Screenshot
                  </a>
                  <a 
                    href="/conversation" 
                    className="block p-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors"
                  >
                    💬 Type Conversation
                  </a>
                  <a 
                    href="/pickup-lines" 
                    className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    💝 AI Pickup Lines
                  </a>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Member since:</span>
                      <span className="font-medium">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="text-green-600 font-medium">Active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
} 