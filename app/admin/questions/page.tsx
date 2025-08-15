"use client"

import { useState, useEffect } from 'react'
import { UserQuestion } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<UserQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuestion, setSelectedQuestion] = useState<UserQuestion | null>(null)
  const [adminResponse, setAdminResponse] = useState('')
  const [status, setStatus] = useState<string>('')
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    answered: 0,
    closed: 0
  })

  useEffect(() => {
    fetchQuestions()
    fetchStats()
  }, [])

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/user-questions')
      const data = await response.json()
      setQuestions(data.questions || [])
    } catch (error) {
      console.error('Error fetching questions:', error)
      toast({
        title: "Error",
        description: "Failed to fetch questions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/user-questions/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleUpdateQuestion = async () => {
    if (!selectedQuestion) return

    try {
      const response = await fetch(`/api/user-questions/${selectedQuestion.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status || selectedQuestion.status,
          admin_response: adminResponse || selectedQuestion.admin_response
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Question updated successfully",
        })
        fetchQuestions()
        fetchStats()
        setSelectedQuestion(null)
        setAdminResponse('')
        setStatus('')
      } else {
        throw new Error('Failed to update question')
      }
    } catch (error) {
      console.error('Error updating question:', error)
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive"
      })
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    try {
      const response = await fetch(`/api/user-questions/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Question deleted successfully",
        })
        fetchQuestions()
        fetchStats()
      } else {
        throw new Error('Failed to delete question')
      }
    } catch (error) {
      console.error('Error deleting question:', error)
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'answered': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Questions Management</h1>
          <p className="text-gray-600">Manage and respond to user questions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.in_progress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.answered}</div>
              <div className="text-sm text-gray-600">Answered</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
              <div className="text-sm text-gray-600">Closed</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Questions List */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Questions</h2>
            <div className="space-y-4">
              {questions.map((question) => (
                <Card 
                  key={question.id} 
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    selectedQuestion?.id === question.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedQuestion(question)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getStatusColor(question.status)}>
                        {question.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {format(new Date(question.created_at), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{question.email}</p>
                    <p className="text-gray-900 line-clamp-2">{question.question}</p>
                    {question.admin_response && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                        <strong>Response:</strong> {question.admin_response}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Question Details & Response */}
          {selectedQuestion && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Question Details</h2>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Question from {selectedQuestion.email}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(selectedQuestion.status)}>
                      {selectedQuestion.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {format(new Date(selectedQuestion.created_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                      {selectedQuestion.question}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <Select 
                      value={status || selectedQuestion.status} 
                      onValueChange={setStatus}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="answered">Answered</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Response
                    </label>
                    <Textarea
                      value={adminResponse || selectedQuestion.admin_response || ''}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      placeholder="Enter your response..."
                      rows={4}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={handleUpdateQuestion}>
                      Update Question
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleDeleteQuestion(selectedQuestion.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
