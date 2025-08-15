/**
 * URL 辅助函数
 * 自动检测环境并返回正确的域名
 */

export function getBaseUrl(host?: string): string {
  // 检测环境
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isLocalhost = host?.includes('localhost') || host?.includes('127.0.0.1')
  const isProduction = !isDevelopment && !isLocalhost
  
  // 返回相应的域名
  if (isProduction) {
    return 'https://www.datinghelpai.com'
  } else {
    return `http://${host || 'localhost:3000'}`
  }
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
