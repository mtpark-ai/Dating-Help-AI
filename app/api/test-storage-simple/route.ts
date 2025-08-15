import { NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = createRouteHandlerSupabaseClient()
    
    console.log('Testing direct file access...')
    
    // 直接尝试访问一个已知存在的文件
    const { data: fileData, error: fileError } = await supabase.storage
      .from('email-assets')
      .download('WechatIMG974.png')
    
    if (fileError) {
      console.error('Error downloading file:', fileError)
      return NextResponse.json({ 
        error: 'Cannot download file from email-assets bucket',
        details: fileError,
        message: 'File access failed. Check RLS policies and bucket permissions.'
      }, { status: 403 })
    }
    
    if (!fileData) {
      return NextResponse.json({ 
        error: 'File not found',
        message: 'WechatIMG974.png not found in email-assets bucket'
      }, { status: 404 })
    }
    
    // 如果能到这里，说明文件访问成功
    console.log('Successfully accessed file from email-assets bucket')
    console.log('File size:', fileData.size)
    
    return NextResponse.json({
      success: true,
      bucket: 'email-assets',
      file: 'WechatIMG974.png',
      fileSize: fileData.size,
      message: 'File access successful - bucket is working via API'
    })
    
  } catch (error) {
    console.error('Error in test-storage-simple route:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 })
  }
}
