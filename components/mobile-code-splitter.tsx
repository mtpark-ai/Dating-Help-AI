"use client"

import { Suspense, lazy, useState, useEffect } from "react"

// 移动端代码分割加载器
export function MobileCodeSplitter({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  const [isMounted, setIsMounted] = useState(false)
  const [isSlowConnection, setIsSlowConnection] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // 检测网络连接速度
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      const slowConnections = ['slow-2g', '2g', '3g']
      setIsSlowConnection(slowConnections.includes(connection.effectiveType))
    }
  }, [])

  if (!isMounted) {
    return <>{fallback}</>
  }

  // 慢速连接时延迟加载非关键组件
  if (isSlowConnection) {
    return (
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    )
  }

  return <>{children}</>
}

// 移动端懒加载Hook
export function useMobileLazyLoad() {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    // 使用Intersection Observer延迟加载
    const timer = setTimeout(() => setShouldLoad(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return shouldLoad
}

// 移动端性能监控Hook
export function useMobilePerformance() {
  const [metrics, setMetrics] = useState({
    lcp: 0,
    fcp: 0,
    cls: 0,
    fid: 0
  })

  useEffect(() => {
    // 监控移动端性能指标
    if ('web-vitals' in window) {
      import('web-vitals').then(({ getCLS, getFCP, getFID, getLCP }) => {
        getCLS((metric) => setMetrics(prev => ({ ...prev, cls: metric.value })))
        getFCP((metric) => setMetrics(prev => ({ ...prev, fcp: metric.value })))
        getFID((metric) => setMetrics(prev => ({ ...prev, fid: metric.value })))
        getLCP((metric) => setMetrics(prev => ({ ...prev, lcp: metric.value })))
      })
    }
  }, [])

  return metrics
}
