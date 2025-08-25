import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // 获取路径参数 - Next.js 15 需要 await params
    const { path: pathSegments } = await params
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse('Path is required', { status: 400 })
    }

    // 构建文件路径
    const filePath = pathSegments.join('/')
    
    // 检测环境并设置相应的域名
    const isDevelopment = process.env.NODE_ENV === 'development'
    const isLocalhost = request.headers.get('host')?.includes('localhost') || request.headers.get('host')?.includes('127.0.0.1')
    const isProduction = !isDevelopment && !isLocalhost
    
    const baseUrl = isProduction ? 'https://www.datinghelpai.com' : `http://${request.headers.get('host')}`
    // 根据环境选择不同的代理策略
    let proxyUrl: string
    let proxyType: string
    
    if (isProduction) {
      // 生产环境：使用正式域名的反向代理
      proxyUrl = `${baseUrl}/email-assets/${filePath}`
      proxyType = 'Production Reverse Proxy'
    } else {
      // 开发环境：使用 localhost 的反向代理
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!supabaseUrl) {
        return new NextResponse('Supabase URL not configured', { status: 500 })
      }
      
      const bucketName = 'email-assets'
      const encodedBucketName = encodeURIComponent(bucketName)
      proxyUrl = `${supabaseUrl}/storage/v1/object/public/${encodedBucketName}/${filePath}`
      proxyType = 'Development Supabase Proxy'
    }
    
    console.log('Proxy type:', proxyType)
    console.log('Proxying request to:', proxyUrl)
    console.log('File path:', filePath)
    console.log('Environment:', isProduction ? 'Production' : 'Development')
    console.log('Base URL:', baseUrl)
    console.log('Public URL example:', `${baseUrl}/email-assets/${filePath}`)
    
    // 执行反向代理请求
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'User-Agent': request.headers.get('user-agent') || 'Next.js Proxy',
        'Accept': request.headers.get('accept') || '*/*',
        'Accept-Language': request.headers.get('accept-language') || 'en-US,en;q=0.9',
        'Accept-Encoding': request.headers.get('accept-encoding') || 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    })

    if (!response.ok) {
      console.error('Proxy request failed:', response.status, response.statusText)
      console.error('Response headers:', Object.fromEntries(response.headers.entries()))
      
      // 尝试获取错误详情
      let errorMessage = 'File not found'
      try {
        const errorText = await response.text()
        if (errorText) {
          console.error('Error response body:', errorText)
          errorMessage = errorText
        }
      } catch (e) {
        console.error('Could not read error response:', e)
      }
      
      return new NextResponse(errorMessage, { status: response.status })
    }

    // 获取响应内容
    const buffer = await response.arrayBuffer()
    
    // 获取原始响应的 headers
    const headers = new Headers()
    
    // 复制重要的响应头
    const contentType = response.headers.get('content-type')
    const contentLength = response.headers.get('content-length')
    const lastModified = response.headers.get('last-modified')
    const etag = response.headers.get('etag')
    
    if (contentType) headers.set('Content-Type', contentType)
    if (contentLength) headers.set('Content-Length', contentLength)
    if (lastModified) headers.set('Last-Modified', lastModified)
    if (etag) headers.set('ETag', etag)
    
    // 设置缓存和 CORS 头
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Range, If-None-Match, If-Modified-Since')
    
    // 返回代理的响应
    return new NextResponse(buffer, {
      status: response.status,
      headers,
    })
  } catch (error) {
    console.error('Error in email-assets proxy route:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // 获取路径参数 - Next.js 15 需要 await params
    const { path: pathSegments } = await params
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse('Path is required', { status: 400 })
    }

    // 构建文件路径
    const filePath = pathSegments.join('/')
    
    // 检测环境并设置相应的域名
    const isDevelopment = process.env.NODE_ENV === 'development'
    const isLocalhost = request.headers.get('host')?.includes('localhost') || request.headers.get('host')?.includes('127.0.0.1')
    const isProduction = !isDevelopment && !isLocalhost
    
    const baseUrl = isProduction ? 'https://www.datinghelpai.com' : `http://${request.headers.get('host')}`
    
    // 根据环境选择不同的代理策略
    let proxyUrl: string
    let proxyType: string
    
    if (isProduction) {
      // 生产环境：使用正式域名的反向代理
      proxyUrl = `${baseUrl}/email-assets/${filePath}`
      proxyType = 'Production Reverse Proxy'
    } else {
      // 开发环境：使用 localhost 的反向代理
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!supabaseUrl) {
        return new NextResponse('Supabase URL not configured', { status: 500 })
      }
      
      const bucketName = 'email-assets'
      const encodedBucketName = encodeURIComponent(bucketName)
      proxyUrl = `${supabaseUrl}/storage/v1/object/public/${encodedBucketName}/${filePath}`
      proxyType = 'Development Supabase Proxy'
    }
    
    console.log('Proxy type:', proxyType)
    console.log('Proxying HEAD request to:', proxyUrl)
    console.log('Environment:', isProduction ? 'Production' : 'Development')
    console.log('Base URL:', baseUrl)
    console.log('Public URL example:', `${baseUrl}/email-assets/${filePath}`)
    
    // 执行反向代理 HEAD 请求
    const response = await fetch(proxyUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': request.headers.get('user-agent') || 'Next.js Proxy',
        'Accept': request.headers.get('accept') || '*/*',
        'Accept-Language': request.headers.get('accept-language') || 'en-US,en;q=0.9',
        'Accept-Encoding': request.headers.get('accept-encoding') || 'gzip, deflate, br',
        'Connection': 'keep-alive',
      },
    })

    if (!response.ok) {
      console.error('Proxy HEAD request failed:', response.status, response.statusText)
      console.error('Response headers:', Object.fromEntries(response.headers.entries()))
      
      // 尝试获取错误详情
      let errorMessage = 'File not found'
      try {
        const errorText = await response.text()
        if (errorText) {
          console.error('Error response body:', errorText)
          errorMessage = errorText
        }
      } catch (e) {
        console.error('Could not read error response:', e)
      }
      
      return new NextResponse(errorMessage, { status: response.status })
    }

    // 获取原始响应的 headers
    const headers = new Headers()
    
    // 复制重要的响应头
    const contentType = response.headers.get('content-type')
    const contentLength = response.headers.get('content-length')
    const lastModified = response.headers.get('last-modified')
    const etag = response.headers.get('etag')
    
    if (contentType) headers.set('Content-Type', contentType)
    if (contentLength) headers.set('Content-Length', contentLength)
    if (lastModified) headers.set('Last-Modified', lastModified)
    if (etag) headers.set('ETag', etag)
    
    // 设置缓存和 CORS 头
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Range, If-None-Match, If-Modified-Since')
    
    // 返回 HEAD 响应（不包含文件内容）
    return new NextResponse(null, {
      status: response.status,
      headers,
    })
  } catch (error) {
    console.error('Error in email-assets HEAD proxy route:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400', // 24 小时
    },
  })
}


