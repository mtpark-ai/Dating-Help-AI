import { useState, useEffect } from 'react'
import { useAuth } from './use-auth'

const GLOBAL_GENERATE_COUNT_KEY = 'globalGenerateCount'

export function useGenerateCount() {
  const [count, setCount] = useState(0)
  const { user } = useAuth()

  // 初始化时从localStorage读取计数
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCount = localStorage.getItem(GLOBAL_GENERATE_COUNT_KEY)
      if (savedCount) {
        setCount(parseInt(savedCount, 10))
      }
    }
  }, [])

  // 监听用户登录状态变化，登录后重置计数
  useEffect(() => {
    if (user) {
      setCount(0)
      localStorage.removeItem(GLOBAL_GENERATE_COUNT_KEY)
    }
  }, [user])

  const incrementCount = () => {
    if (!user) {
      const newCount = count + 1
      setCount(newCount)
      localStorage.setItem(GLOBAL_GENERATE_COUNT_KEY, newCount.toString())
      return newCount
    }
    return 0
  }

  const resetCount = () => {
    setCount(0)
    localStorage.removeItem(GLOBAL_GENERATE_COUNT_KEY)
  }

  const shouldShowSignupModal = () => {
    return !user && count >= 3
  }

  return {
    count,
    incrementCount,
    resetCount,
    shouldShowSignupModal
  }
}
