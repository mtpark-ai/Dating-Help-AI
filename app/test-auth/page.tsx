"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestAuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const testSignUp = async () => {
    setIsLoading(true)
    setMessage("Testing signup...")
    
    try {
      console.log('Testing signup for:', email)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
        },
      })
      
      console.log('SignUp response:', { data, error })
      
      if (error) {
        console.log('SignUp error:', error.message)
        
        // 检查是否是用户已存在的错误
        if (error.message.includes('User already registered') || 
            error.message.includes('already been registered') ||
            error.message.includes('already exists')) {
          
          setMessage(`User already exists: ${error.message}`)
          
          // 尝试自动登录
          console.log('Attempting auto login...')
          const loginResult = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          
          console.log('Auto login result:', loginResult)
          
          if (loginResult.error) {
            setMessage(`Auto login failed: ${loginResult.error.message}`)
          } else {
            setMessage(`Auto login successful! User: ${loginResult.data.user?.email}`)
          }
        } else {
          setMessage(`SignUp Error: ${error.message}`)
        }
      } else {
        if (data.user && !data.session) {
          setMessage(`User created but email not confirmed. User: ${data.user.email}`)
          
          // 尝试自动登录
          console.log('Attempting auto login for existing user...')
          const loginResult = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          
          console.log('Auto login result for existing user:', loginResult)
          
          if (loginResult.error) {
            setMessage(`Auto login failed: ${loginResult.error.message}`)
          } else {
            setMessage(`Auto login successful for existing user! User: ${loginResult.data.user?.email}`)
          }
        } else if (data.session) {
          setMessage(`SignUp Success with session: ${data.user?.email}`)
        } else {
          setMessage(`SignUp Success: ${data.user ? 'User created' : 'Check email'}`)
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setMessage(`Unexpected Error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testSignIn = async () => {
    setIsLoading(true)
    setMessage("Testing signin...")
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        setMessage(`SignIn Error: ${error.message}`)
      } else {
        setMessage(`SignIn Success: ${data.user?.email}`)
      }
    } catch (error) {
      setMessage(`SignIn Error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testGetUser = async () => {
    setIsLoading(true)
    setMessage("Getting user...")
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        setMessage(`GetUser Error: ${error.message}`)
      } else {
        setMessage(`Current User: ${user ? user.email : 'No user'}`)
      }
    } catch (error) {
      setMessage(`GetUser Error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testGetSession = async () => {
    setIsLoading(true)
    setMessage("Getting session...")
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        setMessage(`GetSession Error: ${error.message}`)
      } else {
        setMessage(`Current Session: ${session ? 'Active' : 'No session'} - User: ${session?.user?.email || 'None'}`)
      }
    } catch (error) {
      setMessage(`GetSession Error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testSignOut = async () => {
    setIsLoading(true)
    setMessage("Signing out...")
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setMessage(`SignOut Error: ${error.message}`)
      } else {
        setMessage("Signed out successfully")
      }
    } catch (error) {
      setMessage(`SignOut Error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Test Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
            />
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={testSignUp} 
              disabled={isLoading}
              className="w-full"
            >
              Test SignUp
            </Button>
            
            <Button 
              onClick={testSignIn} 
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              Test SignIn
            </Button>
            
            <Button 
              onClick={testGetUser} 
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              Get Current User
            </Button>
            
            <Button 
              onClick={testGetSession} 
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              Get Current Session
            </Button>
            
            <Button 
              onClick={testSignOut} 
              disabled={isLoading}
              variant="destructive"
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <p className="text-sm">{message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
