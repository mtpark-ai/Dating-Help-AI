"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Sparkles, Copy, MessageCircle, RotateCcw, Check, ChevronUp, ChevronDown } from "lucide-react"
import Image from "next/image"
import Header from "@/components/header"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { FeedbackModal } from "@/components/feedback-modal"
import { SignupModal } from "@/components/signup-modal"
import { useAuth } from "@/hooks/use-auth"

interface UploadedImage {
  id: string
  file: File
  preview: string
}

export default function UploadPage() {
  const [selectedTone, setSelectedTone] = useState("Flirty")
  const [matchName, setMatchName] = useState("")
  const [otherInfo, setOtherInfo] = useState("")
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [generatedReplies, setGeneratedReplies] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null)
  const [copyCount, setCopyCount] = useState(0)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [generateButtonClickCount, setGenerateButtonClickCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  const [isInfoExpanded, setIsInfoExpanded] = useState(true)

  // 监听用户登录状态变化，登录后重置计数
  useEffect(() => {
    if (user) {
      setGenerateButtonClickCount(0)
    }
  }, [user])

  const tones = ["Flirty", "Funny", "Casual"]

  const replyOptions = [
    [
      "That's such an interesting conversation! I'd love to hear more about what you think.",
      "Wow, that sounds amazing! Tell me more about your experience with that.",
      "I really appreciate your perspective on this. It's refreshing to meet someone so thoughtful.",
      "That's fascinating! I'd love to dive deeper into that topic with you.",
      "You have such an interesting way of looking at things! What made you think of it that way?",
    ],
    [
      "Haha, you seem like someone who really knows how to keep things fun! Tell me more.",
      "That's hilarious! I can tell you have a great sense of humor. What else should I know about you?",
      "You're definitely keeping me entertained! I'm curious to hear more of your stories.",
      "I love your energy! You seem like someone who knows how to have a good time.",
      "Your sense of humor is amazing! I'd love to hear more funny stories from you.",
    ],
    [
      "I appreciate your perspective on this. It's refreshing to meet someone so thoughtful.",
      "That's a really interesting point of view. I'd love to continue this conversation.",
      "You seem like someone who really thinks things through. I respect that a lot.",
      "I find your insights really valuable. Thanks for sharing that with me.",
      "You have a really thoughtful approach to things. I'd love to learn more about your perspective.",
    ],
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const newImage: UploadedImage = {
            id: Math.random().toString(36).substr(2, 9),
            file,
            preview: e.target?.result as string,
          }
          setUploadedImages((prev) => [...prev, newImage])
        }
        reader.readAsDataURL(file)
      }
    })

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id))
  }

  const clearAll = () => {
    setUploadedImages([])
    setGeneratedReplies([])
    setCopyCount(0)
    toast({
      description: (
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="w-3 h-3 text-white" />
          </div>
          <span className="text-gray-900 text-sm">All content cleared successfully</span>
        </div>
      ),
      duration: 2000,
      className:
        "fixed bottom-4 right-4 bg-white border border-gray-200 shadow-lg rounded-lg p-3 w-auto max-w-[280px]",
    })
  }

  const handleRegenerateReply = async (index: number) => {
    setRegeneratingIndex(index)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newReplies = [...generatedReplies]
    const currentReply = newReplies[index]
    const availableReplies = replyOptions[index] || replyOptions[0]

    // 过滤掉当前回复，确保生成不同的回复
    const differentReplies = availableReplies.filter((reply) => reply !== currentReply)

    // 随机选择一个不同的回复
    const randomIndex = Math.floor(Math.random() * differentReplies.length)
    newReplies[index] = differentReplies[randomIndex] || availableReplies[0]

    setGeneratedReplies(newReplies)
    setRegeneratingIndex(null)
  }

  const handleGenerateAnswer = async () => {
    if (uploadedImages.length === 0) {
      alert("Please upload at least one screenshot first.")
      return
    }

    // 非登录用户点击计数
    if (!user) {
      const newCount = generateButtonClickCount + 1
      setGenerateButtonClickCount(newCount)
      
      if (newCount >= 5) {
        setShowSignupModal(true)
        // 不重置计数，让用户关闭弹窗后继续计数
        return
      }
    } else {
      // 如果用户已登录，重置计数
      setGenerateButtonClickCount(0)
    }

    setIsInfoExpanded(false)
    setIsGenerating(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // 为每个位置随机选择一个回复
    const newReplies = replyOptions.map((optionSet) => {
      const randomIndex = Math.floor(Math.random() * optionSet.length)
      return optionSet[randomIndex]
    })

    setGeneratedReplies(newReplies)
    setIsGenerating(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // 增加复制计数
      const newCopyCount = copyCount + 1
      setCopyCount(newCopyCount)
      
      toast({
        description: (
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="text-gray-900 text-sm">Message copied to clipboard</span>
          </div>
        ),
        duration: 2000,
        className:
          "fixed bottom-4 right-4 bg-white border border-gray-200 shadow-lg rounded-lg p-3 w-auto max-w-[280px]",
      })
      
      // 检查全网站copy次数
      const globalCopyCount = parseInt(localStorage.getItem('globalCopyCount') || '0') + 1
      localStorage.setItem('globalCopyCount', globalCopyCount.toString())
      
      // 如果全网站copy次数达到5次，显示反馈弹窗
      if (globalCopyCount >= 5) {
        setTimeout(() => {
          setShowFeedbackModal(true)
        }, 1000) // 延迟1秒显示，让用户先看到复制成功的提示
      }
    })
  }

  return (
    <div className="relative min-h-svh md:min-h-screen bg-transparent flex flex-col overflow-hidden function-page-zoom">
      <div
        className="fixed inset-0 -z-10 bg-gradient-to-br from-pink-50 via-white to-purple-50"
        aria-hidden="true"
      />  
      {/* Header */}
      <Header />
      <div className="container mx-auto px-4 pt-2 pb-20 flex-1 flex items-center justify-center">
        <Card className="w-full bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-2xl flex flex-col" style={{ maxWidth: 'calc(64rem * 1.05)' }}>
          {/* Information Section */}
          <CardHeader className="pb-2 flex-shrink-0 cursor-pointer" onClick={() => setIsInfoExpanded(v => !v)}>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
              Information
              {isInfoExpanded ? (
                <ChevronUp className="w-5 h-5 ml-2 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 ml-2 text-gray-500" />
              )}
            </CardTitle>
          </CardHeader>
          {isInfoExpanded && (
            <CardContent className="pb-3 flex-shrink-0">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center">
                    <div className="group relative">
                      <span>Match's Name</span>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                        Enter your match's name or nickname
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </label>
                  <Input
                    placeholder="Default"
                    value={matchName}
                    onChange={(e) => setMatchName(e.target.value)}
                    className="rounded-xl border-gray-300 focus:border-gray-400"
                  />
                </div>
                <div className="col-span-8">
                  <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center">
                    <div className="group relative">
                      <span>Other Information</span>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                        Add details like age, interests, or conversation context
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </label>
                  <Input
                    placeholder="Entering additional information about dating allows us to understand her/him better."
                    value={otherInfo}
                    onChange={(e) => setOtherInfo(e.target.value)}
                    className="rounded-xl border-gray-300 focus:border-gray-400"
                  />
                </div>
              </div>
            </CardContent>
          )}

          {/* Screenshot Section */}
          <CardContent className="py-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Screenshot</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="text-xs px-3 py-1 rounded-lg border-gray-300 hover:bg-gray-50 bg-transparent"
              >
                Clear All
              </Button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 h-72">
              <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide items-start h-full pt-2">
                {/* Upload Button - Always first */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-48 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 flex-shrink-0"
                >
                  <Plus className="w-8 h-8 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-500 text-center px-2">Add Screenshot</p>
                </div>

                {/* Uploaded Images - After upload button */}
                {uploadedImages.map((image) => (
                  <div key={image.id} className="relative group flex-shrink-0">
                    <div className="w-32 h-48 bg-gray-100 rounded-xl overflow-hidden shadow-md">
                      <Image
                        src={image.preview || "/placeholder.svg"}
                        alt="Uploaded screenshot"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 transform translate-x-2 -translate-y-2"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </CardContent>

          {/* Tone and Generate Section */}
          <CardContent className="py-3 border-t border-gray-100 flex-shrink-0">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-medium text-gray-700">Tone:</span>
                <div className="flex space-x-2">
                  {tones.map((tone) => (
                    <Badge
                      key={tone}
                      variant={selectedTone === tone ? "default" : "secondary"}
                      className={`cursor-pointer px-3 py-1 rounded-full text-xs ${
                        selectedTone === tone
                          ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                      onClick={() => setSelectedTone(tone)}
                    >
                      {tone}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerateAnswer}
                disabled={isGenerating || uploadedImages.length === 0}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-3 h-3 animate-spin" />
                    <span>Generating...</span>
                  </div>
                ) : (
                  "Generate Answer"
                )}
              </Button>
            </div>
          </CardContent>

          {/* Generated Replies Section */}
          {generatedReplies.length > 0 && (
            <CardContent className="py-3 border-t border-gray-100 flex-shrink-0">
              <div className="space-y-2">
                {generatedReplies.map((reply, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRegenerateReply(index)}
                        disabled={regeneratingIndex === index}
                        className="p-1 hover:bg-gray-200 rounded-lg"
                      >
                        {regeneratingIndex === index ? (
                          <Sparkles className="w-3 h-3 animate-spin text-purple-500" />
                        ) : (
                          <RotateCcw className="w-3 h-3 text-gray-500 hover:text-purple-500" />
                        )}
                      </Button>
                      <MessageCircle className="w-4 h-4 text-purple-500" />
                      <span className="text-xs font-medium text-gray-700">Reply {index + 1}</span>
                    </div>
                    <div className="flex-1 mx-3">
                      <p className="text-xs text-gray-900">{reply}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(reply)}
                      className="p-1 hover:bg-gray-200 rounded-lg"
                    >
                      <Copy className="w-3 h-3 text-gray-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        pageSource="upload-screenshot"
        onSubmit={async (rating, thoughts, followUp, email) => {
          try {
            const response = await fetch('/api/user-feedback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                rating, 
                thoughts, 
                follow_up: followUp, 
                email,
                page_source: 'upload-screenshot'
              }),
            })

            if (response.ok) {
              console.log('Feedback submitted successfully')
              setCopyCount(0) // 重置本地复制计数
              // 重置全网站copy计数
              localStorage.setItem('globalCopyCount', '0')
            } else {
              console.error('Failed to submit feedback')
            }
          } catch (error) {
            console.error('Error submitting feedback:', error)
          }
        }}
      />

      {/* Signup Modal */}
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onResetCount={() => setGenerateButtonClickCount(0)}
      />

      <Toaster />

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
