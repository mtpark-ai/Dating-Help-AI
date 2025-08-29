"use client"

import Image from "next/image"
import { useState } from "react"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  fetchPriority?: "high" | "low" | "auto"
  className?: string
  loading?: "lazy" | "eager"
  sizes?: string
  quality?: number
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  fetchPriority = "auto",
  className = "",
  loading = "lazy",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 85,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // LCP 图片应该有更高的优先级
  const isLCP = priority || fetchPriority === "high"
  
  const imageProps = {
    src,
    alt,
    className: `${className} ${
      isLoading ? "opacity-0" : "opacity-100"
    } transition-opacity duration-300 ${hasError ? "filter grayscale" : ""}`,
    onLoad: () => setLoading(false),
    onError: () => {
      setLoading(false)
      setHasError(true)
    },
    quality,
    sizes: !fill ? undefined : sizes,
    priority: isLCP,
    loading: isLCP ? "eager" : loading,
    ...(fetchPriority !== "auto" && { fetchPriority }),
    ...props,
  }

  if (fill) {
    return <Image {...imageProps} fill />
  }

  if (width && height) {
    return <Image {...imageProps} width={width} height={height} />
  }

  // 默认使用 fill 模式
  return <Image {...imageProps} fill />
}
