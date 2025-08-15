"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Camera, Upload, Sparkles, Users, ChevronDown, ChevronUp, Heart, X } from "lucide-react"
import Header from "@/components/header"
import type { JSX } from "react/jsx-runtime"
import Footer from "@/components/footer"
import Image from "next/image"
import Link from "next/link"
import { MobileOptimizer } from "@/components/mobile-optimizer"

interface FAQItemProps {
  question: string
  answer: string | JSX.Element
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl overflow-hidden">
      <CardContent className="p-0">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 md:p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 min-h-[44px]"
        >
          <h3 className="text-sm md:text-base font-semibold text-gray-900 pr-4">{question}</h3>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
          )}
        </button>
        {isOpen && (
          <div className="px-4 md:px-6 pb-4 md:pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
            {typeof answer === "string" ? <p className="text-sm md:text-base">{answer}</p> : answer}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [question, setQuestion] = useState("")
  const [email, setEmail] = useState("")

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/user-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, email }),
      })

      if (response.ok) {
        // 重置表单并关闭弹窗
        setQuestion("")
        setEmail("")
        setShowQuestionModal(false)
        
        // 显示成功提示弹窗
        setShowSuccessModal(true)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to submit question'}`)
      }
    } catch (error) {
      console.error('Error submitting question:', error)
      alert('Error submitting question. Please try again.')
    }
  }

  // 点击外部关闭弹窗
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showQuestionModal && target.closest('.question-modal-backdrop') && !target.closest('.question-modal-content')) {
        setShowQuestionModal(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (showQuestionModal && event.key === 'Escape') {
        setShowQuestionModal(false)
      }
    }

    if (showQuestionModal) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showQuestionModal])

  const faqData = [
    {
      question: "What is Dating Help AI?",
      answer:
        "This is your personal AI dating coach — here to help you get better matches and have better conversations on dating apps. Whether you're stuck in a dry chat, unsure about your profile, or want to hook up, we've got you.",
    },
    {
      question: "What dating apps can I use on Dating Help AI?",
      answer:
        "Our dating help tools are designed to work with any dating platform, including Tinder, Bumble, Hinge, Facebook, and even international dating apps. If you're chatting or posting a conversation on Dating AI Coach, we can help.",
    },
    {
      question: "What is Dating AI Coach?",
      answer:
        "Dating AI Coach is a simple tool that helps you do better on dating apps like Tinder, Bumble, Hinge, and Facebook. It gives you easy and interesting replies to use in your chats, so you can talk to more people and get more matches and date invites.",
    },
    {
      question: "What is AI Pickup Lines?",
      answer:
        "AI Pickup Lines is a tool that helps you find good opening lines and conversation starters for dating apps like Tinder, Bumble, Hinge, and Facebook. It makes it easy for you to break the ice and start chatting with new people. Whether you don't know what to say first or want to sound more interesting, AI Pickup Lines gives you simple and useful ideas.",
    },
    {
      question: "What is the hookup?",
      answer:
        "The hookup usually means a casual romantic or sexual meeting with someone, often without a serious relationship (also called situationship). It can also simply mean connecting or meeting with someone for a short time, depending on the situation.",
    },
    {
      question: "Is my personal information safe on Dating Help AI?",
      answer:
        "Yes, your privacy is very important to us. We use secure technologies to protect your data and never share your personal information without your consent.",
    },
    {
      question: "Is Dating Help AI free to use?",
      answer:
        "We offer both free and premium features. You can try our basic AI Pickup Line and advice tools for free. Premium features offer advanced customization and additional support.",
    },
    {
      question: "Can I use Dating Help AI on my phone?",
      answer:
        "Our website is fully mobile-friendly. You can access Dating Help AI from your computer, smartphone, or tablet for support wherever you go.",
    },
  ]

  return (
    <MobileOptimizer>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 landing-page-zoom">
        {/* Header */}
        <Header />

        {/* Hero Section */}
        <section className="max-w-screen-lg mx-auto px-4 md:px-8 py-8 text-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">Dating Help AI</h1>
            <p className="text-lg md:text-xl text-gray-600 mt-4 font-medium">
              Your Tinder, Bumble, Hinge Dating App AI Coach
            </p>
          </div>
        </section>

        {/* Main Feature Section */}
        <section className="max-w-4xl mx-auto px-4 md:px-8 my-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* First Feature Block - Pickup Lines (now on left) */}
            <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden p-4 flex flex-col">
              <CardContent className="p-0 text-center flex flex-col flex-grow">
                {/* Pickup Lines Image */}
                <div className="w-full max-w-md mx-auto h-[17rem] mb-4 relative flex items-center justify-center">
                  <Image
                    src="/images/Pickup-Lines.webp"
                    alt="AI Pickup Lines Feature"
                    fill
                    className="object-contain"
                    loading="lazy"
                  />
                </div>

                {/* Title and Description */}
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">AI Pickup Lines</h2>
                <p className="text-sm md:text-sm text-gray-600 mb-4 flex-grow">Your Tinder, Bumble, Hinge Dating App AI Opener</p>

                {/* Single Function Button */}
                <div className="flex justify-center mt-auto">
                  <Link href="/pickup-lines" className="w-full md:w-1/2">
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-3 md:py-2 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-base md:text-sm min-h-[44px]">
                      Upload Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Second Feature Block - Chat Assistance (now on right) */}
            <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden p-4 flex flex-col">
              <CardContent className="p-0 text-center flex flex-col flex-grow">
                {/* Chat Assistance Image */}
                <div className="w-full max-w-md mx-auto h-[17rem] mb-4 relative flex items-center justify-center">
                  <Image
                    src="/images/Datinghelpai.webp"
                    alt="AI Chat Assistance Feature"
                    fill
                    className="object-contain"
                    loading="lazy"
                  />
                </div>

                {/* Title and Description */}
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">Dating Help AI</h2>
                <p className="text-sm md:text-sm text-gray-600 mb-4 flex-grow">AI-Powered Dating Success</p>

                {/* Two Function Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-auto">
                  <Link href="/upload-screenshot">
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-3 md:py-2 px-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-base md:text-sm min-h-[44px]">
                      Upload Screenshot
                    </Button>
                  </Link>

                  <Link href="/conversation">
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-3 md:py-2 px-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-base md:text-sm min-h-[44px]">
                      Type Conversation
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

         {/* Features Section */}
         <section className="max-w-screen-lg mx-auto px-4 md:px-8 py-12">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Features</h2>
            <p className="text-base md:text-lg text-gray-600">Your Tinder, Bumble, Hinge Dating App AI Coach</p>
          </div>

          <div className="space-y-8 md:space-y-12">
            {/* Dating AI Coach */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mr-4">
                    <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">Dating AI Coach</h3>
                </div>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  Boost your success on Tinder, Bumble, Hinge, and other dating apps with our Dating AI Coach. This dating
                  AI feature helps you create engaging responses and increasing your chances of connections and date
                  invitations.
                </p>
              </div>
              <div className="w-full h-56 md:h-72 flex items-center justify-center relative">
                <Image
                  src="/images/Dating-AI-Coach.webp"
                  alt="Dating AI Coach Feature"
                  width={600}
                  height={450}
                  className="object-contain max-w-full max-h-full"
                  loading="lazy"
                />
              </div>
            </div>

            {/* AI Pick-up Lines */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="md:order-2">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mr-4">
                    <Heart className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">Pickup Lines</h3>
                </div>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  Pickup Lines helps you find the best openers and conversation starters for Tinder, Bumble, Hinge,
                  or any Dating App. Easily learn how to break the ice and start great chats with new people.
                </p>
              </div>
              <div className="w-full h-72 md:h-96 flex items-center justify-center relative">
                <Image
                  src="/images/Pickup-Lines.webp"
                  alt="AI Pick-up Lines Feature"
                  width={600}
                  height={450}
                  className="object-contain max-w-full max-h-full"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Dating Profile Review */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-4">
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">Dating Profile Review</h3>
                </div>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  Get the best dating profile with AI coach tips, templates, and clear ideas. See helpful dating profile
                  bio examples for both males and females, along with photo advice. Our dating profile review will make
                  your profile better and get more matches.
                </p>
              </div>
              <div className="w-full h-56 md:h-72 flex items-center justify-center relative">
                <Image
                  src="/images/Dating-Profile Review.webp"
                  alt="Dating Profile Review Feature"
                  width={600}
                  height={450}
                  className="object-contain max-w-full max-h-full"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Dating App Photo Generator */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
             <div className="md:order-2">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-4">
                    <Camera className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">Dating App Photo Generator</h3>
                </div>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  The Dating App Photo Generator helps you create the perfect dating bio photos. Easily get a high-quality
                  dating app photo that looks attractive and helps you get more likes on the dating app.
                </p>
              </div>
              <div className="w-full h-72 md:h-96 flex items-center justify-center relative">
                <Image
                  src="/images/Photo generator.webp"
                  alt="Dating App Photo Generator Feature"
                  width={600}
                  height={450}
                  className="object-contain max-w-full max-h-full"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* How to Use Section */}
        <section className="bg-gradient-to-r from-gray-50 to-gray-100 py-12 my-16">
          <div className="max-w-screen-lg mx-auto px-4 md:px-8">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">How to Use Dating Help AI</h2>
              <p className="text-base md:text-lg text-gray-600">Get started in just a few simple steps</p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-24 h-40 md:w-28 md:h-48 bg-gradient-to-b from-gray-900 to-gray-700 rounded-3xl mx-auto mb-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-4 left-4 right-4 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Upload className="w-4 h-4 text-white mr-2" />
                    <span className="text-white text-xs font-medium">Upload</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 space-y-2">
                    <div className="h-2 bg-gray-600 rounded"></div>
                    <div className="h-2 bg-gray-600 rounded w-3/4"></div>
                  </div>
                </div>
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2">Upload or Type</h3>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                  Upload a screenshot or type your chat to get started.
                </p>
              </div>

              <div className="text-center">
                <div className="w-24 h-40 md:w-28 md:h-48 bg-gradient-to-b from-gray-900 to-gray-700 rounded-3xl mx-auto mb-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-4 left-4 right-4 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-white mr-2" />
                    <span className="text-white text-xs font-medium">Info</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 space-y-2">
                    <div className="h-2 bg-gray-600 rounded w-1/2"></div>
                    <div className="h-2 bg-gray-600 rounded"></div>
                    <div className="h-2 bg-gray-600 rounded w-2/3"></div>
                  </div>
                </div>
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2">Add Details</h3>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                  Add name, age, interests, or extra context if needed.
                </p>
              </div>

              <div className="text-center">
                <div className="w-24 h-40 md:w-28 md:h-48 bg-gradient-to-b from-gray-900 to-gray-700 rounded-3xl mx-auto mb-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-4 left-4 right-4 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white mr-2" />
                    <span className="text-white text-xs font-medium">AI</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 space-y-2">
                    <div className="h-3 bg-blue-400 rounded"></div>
                    <div className="h-3 bg-purple-400 rounded w-4/5"></div>
                    <div className="h-3 bg-green-400 rounded w-3/4"></div>
                  </div>
                </div>
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2">Generate Replies</h3>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                  AI reads the chat and creates 3 reply suggestions for you.
                </p>
              </div>

              <div className="text-center">
                <div className="w-24 h-40 md:w-28 md:h-48 bg-gradient-to-b from-gray-900 to-gray-700 rounded-3xl mx-auto mb-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-4 left-4 right-4 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white mr-2" />
                    <span className="text-white text-xs font-medium">Send</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 space-y-2">
                    <div className="h-2 bg-gray-600 rounded"></div>
                    <div className="h-4 bg-green-500 rounded"></div>
                    <div className="h-2 bg-gray-600 rounded w-2/3"></div>
                  </div>
                </div>
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2">Customize & Send</h3>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                  Edit tone, change suggestions, or send your final reply.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-screen-lg mx-auto px-4 md:px-8 py-12">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions - FAQs</h2>
            <p className="text-base md:text-lg text-gray-600">Everything you need to know about Dating Help AI</p>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>

          {/* Ask Question Button */}
          <div className="text-center mt-12">
            <Button 
              onClick={() => setShowQuestionModal(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 md:py-2 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-base md:text-sm min-h-[44px] w-full md:w-1/3"
            >
              Ask a Question
            </Button>
          </div>
        </section>

        {/* Question Modal */}
        {showQuestionModal && (
          <div className="question-modal-backdrop fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="question-modal-content bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-1">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Ask a Question</h2>
                  <p className="text-gray-600 mt-1">We'll get back to you as soon as possible</p>
                </div>
                <button
                  onClick={() => setShowQuestionModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <form onSubmit={handleSubmitQuestion} className="px-6 pb-6 pt-4 space-y-4">
                {/* Question Input */}
                <div>
                  <label htmlFor="question" className="block text-sm font-medium text-gray-900 mb-2 mt-0">
                    Your question
                  </label>
                  <textarea
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    required
                    rows={3}
                    placeholder="Type your question here..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={!question.trim()}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-base"
                  >
                    Submit Question
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Thank you!</h3>
              <p className="text-gray-600 mb-6">Thank you for your question! We'll get back to you as soon as possible.</p>
              <Button
                onClick={() => setShowSuccessModal(false)}
                className="bg-pink-100 hover:bg-pink-200 text-pink-600 font-semibold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Got it!
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <Footer />
      </div>
    </MobileOptimizer>
  )
}
