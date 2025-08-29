"use client"

import Image from "next/image"
import { useState } from "react"

interface ResponsiveImageProps {
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
  responsive?: boolean
}

export function ResponsiveImage({
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
  responsive = true,
  ...props
}: ResponsiveImageProps) {
  const [isLoading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // 生成响应式图片源
  const generateResponsiveSrc = (baseSrc: string) => {
    if (!responsive) return baseSrc;
    
    // 移除扩展名并添加响应式后缀
    const basePath = baseSrc.replace(/\.(webp|jpg|jpeg|png)$/i, '');
    const extension = baseSrc.match(/\.(webp|jpg|jpeg|png)$/i)?.[0] || '.webp';
    
    return {
      mobile: `${basePath}-mobile${extension}`,
      tablet: `${basePath}-tablet${extension}`,
      desktop: `${basePath}-desktop${extension}`,
      original: baseSrc
    };
  };

  const responsiveSrc = generateResponsiveSrc(src);
  
  // 生成 srcSet 用于响应式图片
  const srcSet = responsive && typeof responsiveSrc === 'object' 
    ? `${responsiveSrc.mobile} 320w, ${responsiveSrc.tablet} 768w, ${responsiveSrc.desktop} 1200w, ${responsiveSrc.original} 1920w`
    : undefined;

  // 生成 sizes 属性
  const sizes = responsive 
    ? "(max-width: 320px) 320px, (max-width: 768px) 768px, (max-width: 1200px) 1200px, 1920px"
    : undefined;

  const imageProps = {
    src: typeof responsiveSrc === 'object' ? responsiveSrc.original : responsiveSrc,
    alt,
    className: `${className} ${
      isLoading ? "opacity-0 image-loading" : "opacity-100"
    } transition-opacity duration-300 ${hasError ? "filter grayscale" : ""}`,
    onLoad: () => setLoading(false),
    onError: () => {
      setLoading(false)
      setHasError(true)
    },
    quality,
    priority: priority || fetchPriority === "high",
    loading: (priority || fetchPriority === "high") ? "eager" : loading,
    ...(fetchPriority !== "auto" && { fetchPriority }),
    ...(srcSet && { srcSet }),
    ...(sizes && { sizes }),
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
