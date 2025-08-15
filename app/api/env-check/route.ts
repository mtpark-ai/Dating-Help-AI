// app/api/env-check/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  let urlHost: string | null = null
  try { urlHost = new URL(url).host } catch {}

  return NextResponse.json({
    hasUrl: Boolean(url),
    urlHost,         
    anonLen: anon.length, 
  })
}
