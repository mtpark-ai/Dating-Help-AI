"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Sparkles, Copy, MessageCircle, RotateCcw, Check } from "lucide-react"
import Image from "next/image"
import Header from "@/components/header"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { clientAPI } from "@/lib/client-api"

interface UploadedImage {
  id: string
  file: File
  preview: string
}

export default function PickupLinesPage() {
  const [selectedTone, setSelectedTone] = useState("Flirty")
  const [matchName, setMatchName] = useState("")
  const [otherInfo, setOtherInfo] = useState("")
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [generatedReplies, setGeneratedReplies] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null)
  const [profileAnalysis, setProfileAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showProfileAnalysis, setShowProfileAnalysis] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const tones = ["Flirty", "Funny", "Casual"]

  const replyOptions = [
    [
      "I couldn't help but notice your smile in your photos - it's absolutely captivating! What's the story behind that adventure pic?",
      "Your profile caught my eye, especially that travel photo! I'm curious - what's been your favorite destination so far?",
      "I have to say, your sense of style is incredible! That photo of you at the art gallery - are you into contemporary art?",
    ],
    [
      "I see you're into hiking - please tell me you're better at reading trail maps than I am at reading dating profiles! 😅",
      "Your dog is adorable, but I have to ask - who's really in charge of the walks, you or them?",
      "I noticed you love coffee as much as I do - want to debate whether pineapple belongs on pizza over lattes?",
    ],
    [
      "Hello! I noticed we share similar interests in photography. I'd love to hear about your favorite subjects to capture.",
      "Your profile mentions you work in marketing - I'm curious about your thoughts on the industry's recent digital trends.",
      "I see you enjoy reading. What book has influenced your perspective the most recently?",
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

  const handleAnalyzeProfile = async () => {
    if (uploadedImages.length === 0) {
      toast({
        description: "Please upload at least one profile image first.",
        duration: 3000,
        className: "fixed bottom-4 right-4 bg-red-50 border border-red-200 shadow-lg rounded-lg p-3 w-auto max-w-[280px]",
      })
      return
    }

    setIsAnalyzing(true)
    
    try {
      const images = uploadedImages.map(img => img.preview)
      const result = await clientAPI.analyzeProfile({
        images,
        matchName: matchName || undefined,
        otherInfo: otherInfo || undefined
      })
      
      setProfileAnalysis(result)
      setShowProfileAnalysis(true)
      
      // Save as intermediate results for pickup lines generation
      // This data will be used as reference for generating personalized pickup lines
      
      toast({
        description: (
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="text-gray-900 text-sm">Profile analyzed successfully!</span>
          </div>
        ),
        duration: 3000,
        className: "fixed bottom-4 right-4 bg-white border border-gray-200 shadow-lg rounded-lg p-3 w-auto max-w-[320px]",
      })
    } catch (error) {
      console.error('Profile analysis error:', error)
      toast({
        description: "Failed to analyze profile. Please try again.",
        duration: 3000,
        className: "fixed bottom-4 right-4 bg-red-50 border border-red-200 shadow-lg rounded-lg p-3 w-auto max-w-[280px]",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const removeImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id))
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

    if (!profileAnalysis) {
      alert("Please analyze the profile first.")
      return
    }

    setIsGenerating(true)
    setShowProfileAnalysis(false)
    
    try {
      const result = await clientAPI.generatePickupLines({
        summary: profileAnalysis.summary,
        insights: profileAnalysis.insights,
        tone: selectedTone,
        matchName: matchName || undefined,
        otherInfo: otherInfo || undefined
      })
      
      setGeneratedReplies(result.pickupLines)
    } catch (error) {
      console.error('Error generating pickup lines:', error)
      // Fallback to original replies if API fails
      const newReplies = replyOptions.map((optionSet) => {
        const randomIndex = Math.floor(Math.random() * optionSet.length)
        return optionSet[randomIndex]
      })
      setGeneratedReplies(newReplies)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
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
    })
  }

  return (
    <div className="bg-gradient-to-br from-pink-50 via-white to-purple-50 flex flex-col overflow-hidden">
      {/* Header */}
      <Header />

      <div className="container mx-auto px-4 pt-2 pb-20 flex-1 flex items-center justify-center">
        <Card className="w-full max-w-5xl bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-2xl flex flex-col">
          {/* Information Section */}
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="text-xl font-bold text-gray-900">Information</CardTitle>
          </CardHeader>

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
                  className="rounded-xl border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent h-10 text-sm"
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
                  className="rounded-xl border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent h-10 text-sm"
                />
              </div>
            </div>
          </CardContent>

          {/* Screenshot Section */}
          <CardContent className="py-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Profile Screenshots</h3>
              <Button
                onClick={handleAnalyzeProfile}
                disabled={isAnalyzing || uploadedImages.length === 0}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isAnalyzing ? (
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-3 h-3 animate-spin" />
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  "Analyze Profile"
                )}
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

          {/* Profile Analysis Results Section */}
          {showProfileAnalysis && profileAnalysis && (
            <CardContent className="py-3 border-t border-gray-100">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Profile Analysis Results</h3>
                <div className="space-y-3">
                  {profileAnalysis.summary && (
                    <div className="bg-blue-50 rounded-xl p-3">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Summary</h4>
                      <p className="text-sm text-blue-800">{profileAnalysis.summary}</p>
                    </div>
                  )}
                  {profileAnalysis.insights && profileAnalysis.insights.length > 0 && (
                    <div className="bg-purple-50 rounded-xl p-3">
                      <h4 className="text-sm font-medium text-purple-900 mb-2">Key Insights</h4>
                      <ul className="text-sm text-purple-800 space-y-1">
                        {profileAnalysis.insights.map((insight: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-purple-500 mr-2">•</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          )}

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
