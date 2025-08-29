"use client"

import { useEffect, useState } from 'react'

interface MobileOptimizerProps {
  children: React.ReactNode
}

export function MobileOptimizer({ children }: MobileOptimizerProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    // 检测移动设备
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      setIsMobile(isMobileDevice)
    }

    // 检测触控设备
    const checkTouchDevice = () => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      setIsTouchDevice(isTouch)
    }

    checkMobile()
    checkTouchDevice()

    // 监听窗口大小变化
    const handleResize = () => {
      checkMobile()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div 
      className={`${isMobile ? 'mobile-optimized' : ''} ${isTouchDevice ? 'touch-optimized' : ''}`}
      style={{
        // 移动端优化样式
        touchAction: isTouchDevice ? 'manipulation' : 'auto',
        WebkitOverflowScrolling: isTouchDevice ? 'touch' : 'auto',
        // 确保最小触控目标大小 (44px)
        minHeight: isTouchDevice ? '44px' : 'auto',
      }}
    >
      {children}
    </div>
  )
}

// 移动端优化的CSS类
export const mobileStyles = `
  .mobile-optimized {
    /* 移动端字体大小优化 */
    font-size: 16px; /* 防止iOS缩放 */
  }
  
  .touch-optimized button,
  .touch-optimized a {
    /* 确保触控目标足够大 */
    min-height: 44px;
    min-width: 44px;
    padding: 12px 16px;
  }
  
  .touch-optimized input,
  .touch-optimized textarea {
    /* 移动端输入框优化 */
    font-size: 16px;
    padding: 12px;
  }
  
  /* 移动端滚动优化 */
  .touch-optimized {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }
  
  /* 移动端点击优化 */
  .touch-optimized * {
    -webkit-tap-highlight-color: transparent;
  }
` 