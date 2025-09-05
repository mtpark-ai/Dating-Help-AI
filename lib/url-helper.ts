/**
 * URL 辅助函数
 * 自动检测环境并返回正确的域名
 */

export function getBaseUrl(host?: string): string {
  // 在客户端，优先使用当前窗口的origin
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // 服务器端：优先使用明确设置的APP_URL环境变量
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  
  // 检测环境（服务器端）
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isLocalhost = host?.includes('localhost') || host?.includes('127.0.0.1')
  const isProduction = !isDevelopment && !isLocalhost

  const url = isProduction ? 'https://www.datinghelpai.com' : 'http://localhost:3000'
  console.log('getBaseUrl', url)

  return url
}

/**
 * 获取 email-assets 的完整 URL
 */
export function getEmailAssetsUrl(filePath: string, host?: string): string {
  const baseUrl = getBaseUrl(host)
  return `${baseUrl}/email-assets/${filePath}`
}

/**
 * 获取当前环境信息
 */
export function getEnvironmentInfo(host?: string) {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isLocalhost = host?.includes('localhost') || host?.includes('127.0.0.1')
  const isProduction = !isDevelopment && !isLocalhost
  
  return {
    isDevelopment,
    isLocalhost,
    isProduction,
    baseUrl: getBaseUrl(host),
    environment: isProduction ? 'Production' : 'Development'
  }
}
