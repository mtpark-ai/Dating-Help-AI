"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

const STROKE = "#6B7280"   // gray-500
const FILL   = "#FCE7F3"   // pink-100

// 图标 r=11，让灰色环贴近外圈
const CryFace = ({ active, className = "w-9 h-9" }: { active?: boolean; className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <circle cx="12" cy="12" r="11" fill={active ? FILL : "none"} stroke={STROKE} strokeWidth="2" />
    <circle cx="9" cy="10" r="1" fill={STROKE} />
    <circle cx="15" cy="10" r="1" fill={STROKE} />
    <path d="M8 16c1.2-1 2.8-1.5 4-1.5S14.8 15 16 16" stroke={STROKE} strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M7.3 11.5c0 .9.7 1.6 1.2 2 .5-.4 1.2-1.1 1.2-2 0-.8-.6-1.2-1.2-2-.6.8-1.2 1.2-1.2 2z" fill={STROKE}/>
  </svg>
)

const SadFace = ({ active, className = "w-9 h-9" }: any) => (
  <svg viewBox="0 0 24 24" className={className}>
    <circle cx="12" cy="12" r="11" fill={active ? FILL : "none"} stroke={STROKE} strokeWidth="2" />
    <circle cx="9" cy="10" r="1" fill={STROKE} />
    <circle cx="15" cy="10" r="1" fill={STROKE} />
    <path d="M8 16c1.5-1.2 3.3-1.8 4-1.8s2.5.6 4 1.8" stroke={STROKE} strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
)

const MehFace = ({ active, className = "w-9 h-9" }: any) => (
  <svg viewBox="0 0 24 24" className={className}>
    <circle cx="12" cy="12" r="11" fill={active ? FILL : "none"} stroke={STROKE} strokeWidth="2" />
    <circle cx="9" cy="10" r="1" fill={STROKE} />
    <circle cx="15" cy="10" r="1" fill={STROKE} />
    <path d="M9 15h6" stroke={STROKE} strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
)

const SmileFace = ({ active, className = "w-9 h-9" }: any) => (
  <svg viewBox="0 0 24 24" className={className}>
    <circle cx="12" cy="12" r="11" fill={active ? FILL : "none"} stroke={STROKE} strokeWidth="2" />
    <circle cx="9" cy="10" r="1" fill={STROKE} />
    <circle cx="15" cy="10" r="1" fill={STROKE} />
    <path d="M8.5 14.5c1 .9 2.2 1.5 3.5 1.5s2.5-.6 3.5-1.5" stroke={STROKE} strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
)

const GrinFace = ({ active, className = "w-9 h-9" }: any) => (
  <svg viewBox="0 0 24 24" className={className}>
    <circle cx="12" cy="12" r="11" fill={active ? FILL : "none"} stroke={STROKE} strokeWidth="2" />
    <circle cx="9" cy="10" r="1" fill={STROKE} />
    <circle cx="15" cy="10" r="1" fill={STROKE} />
    <path d="M8 14.5h8c0 2-2.2 3.5-4 3.5s-4-1.5-4-3.5z" stroke={STROKE} strokeWidth="2" fill="none" />
  </svg>
)

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (rating: number, thoughts: string, followUp: boolean, email?: string) => void
  pageSource: string // 添加页面来源参数
}

export function FeedbackModal({ isOpen, onClose, onSubmit, pageSource }: FeedbackModalProps) {
  const [rating, setRating] = useState(5)
  const [thoughts, setThoughts] = useState("")
  const [followUp, setFollowUp] = useState<boolean | undefined>(undefined)
  const [email, setEmail] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [userFollowUpChoice, setUserFollowUpChoice] = useState<boolean | undefined>(undefined)

  if (!isOpen) return null

  // 如果显示成功弹窗，则不显示反馈弹窗
  if (showSuccessModal) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Thank you!</h3>
          <p className="text-gray-600 mb-6">
            {userFollowUpChoice === true 
              ? "Thanks for your feedback! We'll review it and get back to you soon"
              : "Thanks for sharing your thoughts with us! We appreciate you."
            }
          </p>
          <Button
            onClick={() => {
              setShowSuccessModal(false)
              setUserFollowUpChoice(undefined) // 重置用户选择状态
              onClose() // 关闭整个反馈弹窗，回到之前的界面
            }}
            className="bg-pink-100 hover:bg-pink-200 text-pink-600 font-semibold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Back to site
          </Button>
        </div>
      </div>
    )
  }

  const handleSubmit = () => {
    // 如果用户没有选择或选择不跟进，清空邮箱
    const finalEmail = followUp === true ? email : ""
    const finalFollowUp = followUp === true
    
    // 保存用户的选择用于成功弹窗
    setUserFollowUpChoice(followUp === true)
    
    onSubmit(rating, thoughts, finalFollowUp, finalEmail)
    
    // 隐藏反馈弹窗，显示成功弹窗
    setShowSuccessModal(true)
    
    // 重置表单状态
    setRating(5)
    setThoughts("")
    setFollowUp(undefined)
    setEmail("")
  }

  const emojis = [
    { value: 1, Icon: CryFace,   label: "Very Poor" },
    { value: 2, Icon: SadFace,   label: "Poor" },
    { value: 3, Icon: MehFace,   label: "Neutral" },
    { value: 4, Icon: SmileFace, label: "Good" },
    { value: 5, Icon: GrinFace,  label: "Excellent" }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Give feedback</h2>

        {/* 问题1：评分 */}
        <div className="mb-8">
          <p className="text-gray-700 mb-6">Do you find this tool helpful?</p>

          <div className="flex justify-center space-x-9">
            {emojis.map(({ value, Icon, label }) => {
              const active = rating === value
              return (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  title={label}
                  aria-pressed={active}
                  className="p-0 leading-none bg-transparent rounded-full"
                >
                  <span
                    className={`${active ? "ring-[10px] ring-gray-200" : ""} inline-flex items-center justify-center rounded-full w-8 h-8`}
                  >
                    <Icon active={active} className="w-full h-full block" />
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 问题2：反馈内容 */}
        <div className="mb-4">
          <p className="text-gray-700 mb-4">Do you have any thoughts you'd like to share?</p>
          <textarea
            value={thoughts}
            onChange={(e) => setThoughts(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full px-4 py-3 rounded-2xl resize-none text-gray-900 placeholder-gray-500 outline-none"
            style={{
              border: "2px solid transparent",
              borderRadius: "1rem", // 圆角
              background:
                "linear-gradient(#fff, #fff) padding-box, linear-gradient(90deg, #f9a8d4, #c084fc, #f9a8d4) border-box",
              backgroundClip: "padding-box, border-box",
            }}
            rows={3}
          />
        </div>

        {/* 问题3：是否允许跟进 */}
        <div className={followUp === true ? "mb-4" : "mb-8"}>
          <p className="text-gray-700 mb-4">May we follow you up on your feedback?</p>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="followUp"
                checked={followUp === true}
                onChange={() => setFollowUp(true)}
                className="w-4 h-4 accent-purple-600 border-gray-300 focus:ring-purple-500"
              />
              <span className="text-gray-700">Yes</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="followUp"
                checked={followUp === false}
                onChange={() => {
                  setFollowUp(false)
                  setEmail("") // 清空邮箱
                }}
                className="w-4 h-4 accent-purple-600 border-gray-300 focus:ring-purple-500"
              />
              <span className="text-gray-700">No</span>
            </label>
          </div>
        </div>

        {/* 问题4：邮箱输入（动态显示，只在选择yes时出现） */}
        {followUp === true && (
          <div className="mb-10 animate-in slide-in-from-top-2 duration-300">
            <p className="text-gray-700 mb-4">Please provide your email for follow-up:</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-500 outline-none"
              style={{
                border: "2px solid transparent",
                borderRadius: "0.75rem", // 对应 rounded-xl
                background:
                  "linear-gradient(#fff, #fff) padding-box, linear-gradient(90deg, #f9a8d4, #c084fc, #f9a8d4) border-box",
                backgroundClip: "padding-box, border-box",
              }}
              required={followUp === true}
            />
          </div>
        )}

        <div className="flex space-x-3">
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Send
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Cancel
          </Button>
        </div>
      </div>


    </div>
  )
}