"use client"

import Image from "next/image"
import { useState, useEffect } from "react"

interface MobileOptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  fetchPriority?: "high" | "low" | "auto"
  className?: string
  loading?: "lazy" | "eager"
  quality?: number
  mobileQuality?: number
  desktopSizes?: string
  mobileSizes?: string
}

export function MobileOptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  fetchPriority = "auto",
  className = "",
  loading = "lazy",
  quality = 85,
  mobileQuality = 75, // 移动端使用更高压缩比
  desktopSizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  mobileSizes = "(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw",
  ...props
}: MobileOptimizedImageProps) {
  const [isLoading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // 检测移动设备
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 移动端优化的图片源
  const generateMobileOptimizedSrc = (baseSrc: string) => {
    if (!isMobile) return baseSrc
    
    // 为移动端生成更小的图片
    const basePath = baseSrc.replace(/\.(webp|jpg|jpeg|png)$/i, '')
    const extension = baseSrc.match(/\.(webp|jpg|jpeg|png)$/i)?.[0] || '.webp'
    
    // 移动端尝试加载mobile版本，不存在则回退到原图
    return `${basePath}-mobile${extension}`
  }

  const imageProps = {
    src: generateMobileOptimizedSrc(src),
    alt,
    className: `${className} ${
      isLoading ? "opacity-0 image-loading" : "opacity-100"
    } transition-opacity duration-300 ${hasError ? "filter grayscale" : ""}`,
    onLoad: () => setLoading(false),
    onError: () => {
      setLoading(false)
      setHasError(true)
      // 移动端加载失败时回退到原图
      if (isMobile) {
        const img = document.querySelector(`img[alt="${alt}"]`) as HTMLImageElement
        if (img) {
          img.src = src
        }
      }
    },
    quality: isMobile ? mobileQuality : quality,
    priority: priority || fetchPriority === "high",
    loading: (priority || fetchPriority === "high") ? "eager" : loading,
    sizes: isMobile ? mobileSizes : desktopSizes,
    ...(fetchPriority !== "auto" && { fetchPriority }),
    ...props,
  }

  if (fill) {
    return <Image {...imageProps} fill />
  }

  if (width && height) {
    // 移动端自动缩放
    const mobileWidth = isMobile ? Math.min(width, 480) : width
    const mobileHeight = isMobile ? Math.round(height * (mobileWidth / width)) : height
    
    return <Image {...imageProps} width={mobileWidth} height={mobileHeight} />
  }

  // 默认使用 fill 模式
  return <Image {...imageProps} fill />
}
