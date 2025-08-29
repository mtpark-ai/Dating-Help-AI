import { NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = createRouteHandlerSupabaseClient()
    
    console.log('Testing Supabase Storage access...')
    
    // 方法1：尝试直接访问 bucket 中的文件（测试 bucket 是否存在）
    try {
      const { data: files, error: filesError } = await supabase.storage
        .from('email-assets')
        .list('', { limit: 1 })
      
      if (filesError) {
        console.error('Error accessing email-assets bucket:', filesError)
        return NextResponse.json({ 
          error: 'Cannot access email-assets bucket',
          details: filesError,
          message: 'Bucket exists but cannot be accessed. Check RLS policies.'
        }, { status: 403 })
      }
      
      // 如果能到这里，说明 bucket 存在且可访问
      console.log('Successfully accessed email-assets bucket')
      console.log('Files found:', files?.length || 0)
      
      return NextResponse.json({
        bucket: {
          id: 'email-assets',
          name: 'email-assets',
          public: true,
          accessible: true
        },
        files: files || [],
        totalFiles: files?.length || 0,
        message: 'email-assets bucket found and accessible'
      })
      
    } catch (bucketError) {
      console.error('Error testing bucket access:', bucketError)
      
      // 方法2：尝试列出所有 buckets（可能因为权限问题失败）
      try {
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
        
        if (bucketsError) {
          console.error('Error listing buckets:', bucketsError)
          return NextResponse.json({ 
            error: 'Cannot list buckets (permission issue)',
            details: bucketsError,
            message: 'Storage API access restricted. Bucket may exist but cannot be listed.'
          }, { status: 403 })
        }
        
        console.log('Available buckets:', buckets)
        
        const emailAssetsBucket = buckets.find(bucket => bucket.id === 'email-assets')
        
        if (!emailAssetsBucket) {
          return NextResponse.json({ 
            error: 'email-assets bucket not found in list',
            availableBuckets: buckets.map(b => ({ id: b.id, name: b.name, public: b.public })),
            message: 'email-assets bucket not found in available buckets list'
          }, { status: 404 })
        }
        
        return NextResponse.json({
          bucket: {
            id: emailAssetsBucket.id,
            name: emailAssetsBucket.name,
            public: emailAssetsBucket.public,
            accessible: true
          },
          files: [],
          totalFiles: 0,
          message: 'email-assets bucket found in list'
        })
        
      } catch (listError) {
        console.error('Error listing buckets:', listError)
        return NextResponse.json({ 
          error: 'Cannot access storage API',
          details: listError,
          message: 'Storage API access completely restricted. Check Supabase configuration.'
        }, { status: 500 })
      }
    }
    
  } catch (error) {
    console.error('Error in test-storage route:', error)
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 })
  }
}
