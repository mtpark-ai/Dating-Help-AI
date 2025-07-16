"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Copy, User, MessageCircle, Sparkles, RotateCcw, Check, Send } from "lucide-react"
import Header from "@/components/header"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { clientAPI, type Message } from "@/lib/client-api"

export default function ConversationPage() {
  const [isInfoExpanded, setIsInfoExpanded] = useState(true)
  const [selectedTone, setSelectedTone] = useState("Flirty")
  const [matchName, setMatchName] = useState("")
  const [otherInfo, setOtherInfo] = useState("")
  const [generatedReplies, setGeneratedReplies] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [messageType, setMessageType] = useState<"match" | "user">("match")
  const { toast } = useToast()

  const tones = ["Flirty", "Funny", "Casual"]

  const [conversation, setConversation] = useState<Message[]>([])


  const handleRegenerateReply = async (index: number) => {
    setRegeneratingIndex(index)

    // 不再需要根据消息类型区分，统一生成高质量回复

    try {
      const currentReply = generatedReplies[index]
      const response = await clientAPI.regenerateReply({
        conversation,
        matchName: matchName || undefined,
        otherInfo: otherInfo || undefined,
        tone: selectedTone,
        currentReply,
        replyIndex: index
      })

      const newReplies = [...generatedReplies]
      newReplies[index] = response.reply
      setGeneratedReplies(newReplies)
    } catch (error) {
      console.error('Failed to regenerate reply:', error)
      toast({
        description: "Failed to regenerate reply. Please try again.",
        duration: 3000,
        className: "fixed bottom-4 right-4 bg-red-50 border border-red-200 shadow-lg rounded-lg p-3 w-auto max-w-[280px]",
      })
    } finally {
      setRegeneratingIndex(null)
    }
  }

  const handleGenerateAnswer = async () => {
    if (conversation.length === 0) {
      alert("Please add some messages to the conversation first.")
      return
    }

    // Collapse Information section when Generate Reply is clicked
    setIsInfoExpanded(false)

    setIsGenerating(true)

    try {
      const response = await clientAPI.generateReplies({
        conversation,
        matchName: matchName || undefined,
        otherInfo: otherInfo || undefined,
        tone: selectedTone
      })

      setGeneratedReplies(response.replies)
    } catch (error) {
      console.error('Failed to generate replies:', error)
      toast({
        description: "Failed to generate replies. Please try again.",
        duration: 3000,
        className: "fixed bottom-4 right-4 bg-red-50 border border-red-200 shadow-lg rounded-lg p-3 w-auto max-w-[280px]",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAddMessage = () => {
    if (newMessage.trim() === "") return

    const message: Message = {
      sender: messageType,
      message: newMessage.trim(),
    }

    setConversation((prev) => [...prev, message])
    setNewMessage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleAddMessage()
    }
  }

  const clearConversation = () => {
    setConversation([])
    setGeneratedReplies([])
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
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setIsInfoExpanded(!isInfoExpanded)}
            >
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                Information
                {isInfoExpanded ? (
                  <ChevronUp className="w-4 h-4 ml-2 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
                )}
              </CardTitle>
            </div>
          </CardHeader>

          {isInfoExpanded && (
            <CardContent className="pt-0 pb-3 flex-shrink-0">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center">
                    <div className="group relative">
                      <span>Match's Name</span>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                        Enter your match's name
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </label>
                  <Input
                    placeholder="Default"
                    value={matchName}
                    onChange={(e) => setMatchName(e.target.value)}
                    className="rounded-xl border-gray-200 focus:ring-0 focus:border-gray-200 h-10 text-sm"
                  />
                </div>
                <div className="col-span-8">
                  <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center">
                    <div className="group relative">
                      <span>Other Information</span>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                        Add details like age, interests
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </label>
                  <Input
                    placeholder="Entering additional information about dating allows us to understand her/him better."
                    value={otherInfo}
                    onChange={(e) => setOtherInfo(e.target.value)}
                    className="rounded-xl border-gray-200 focus:ring-0 focus:border-gray-200 h-10 text-sm"
                  />
                </div>
              </div>
            </CardContent>
          )}

          {/* Chat Section - Increased height to match upload page */}
          <CardContent className="py-3 border-t border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chat</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={clearConversation}
                className="text-xs px-3 py-1 rounded-lg border-gray-300 hover:bg-gray-50 bg-transparent"
              >
                Clear Chat
              </Button>
            </div>

            <div className="space-y-2 mb-4 overflow-y-auto h-36">
              {conversation.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  No messages yet. Add your first message below.
                </div>
              ) : (
                conversation.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-2 ${
                      msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        msg.sender === "user" ? "bg-gradient-to-r from-purple-500 to-indigo-500" : "bg-gray-300"
                      }`}
                    >
                      {msg.sender === "user" ? (
                        <span className="text-white font-semibold text-xs">M</span>
                      ) : (
                        <User className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div
                      className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl ${
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                          : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      <p className="text-xs">{msg.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input Section */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center space-x-2 mb-3">
                <Button
                  variant={messageType === "match" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMessageType("match")}
                  className={`px-3 py-1 rounded-xl text-xs ${
                    messageType === "match"
                      ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600"
                      : "border-gray-300 hover:bg-gray-50 bg-transparent"
                  }`}
                >
                  Match's Message
                </Button>
                <Button
                  variant={messageType === "user" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMessageType("user")}
                  className={`px-3 py-1 rounded-xl text-xs ${
                    messageType === "user"
                      ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600"
                      : "border-gray-300 hover:bg-gray-50 bg-transparent"
                  }`}
                >
                  My Message
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder={`Type ${messageType === "match" ? "match's" : "your"} message...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 rounded-xl border-gray-200 focus:ring-0 focus:border-gray-200 focus:outline-none h-10 text-sm"
                />
                <Button
                  onClick={handleAddMessage}
                  disabled={newMessage.trim() === ""}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-3 py-2 rounded-xl"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
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
                disabled={isGenerating || conversation.length === 0}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-medium"
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </div>
                ) : (
                  "Generate Reply"
                )}
              </Button>
            </div>
          </CardContent>

          {/* Generated Replies Section */}
          {generatedReplies.length > 0 && (
            <CardContent className="py-3 border-t border-gray-100 flex-shrink-0">
              <div className="space-y-2">
                {generatedReplies.map((reply, index) => {
                  return (
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
                            <Sparkles className="w-4 h-4 animate-spin text-purple-500" />
                          ) : (
                            <RotateCcw className="w-4 h-4 text-gray-500 hover:text-purple-500" />
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
                        <Copy className="w-4 h-4 text-gray-500" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
      <Toaster />
    </div>
  )
}
