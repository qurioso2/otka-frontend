import { NextResponse } from 'next/server';
import { R2_CONFIG } from '@/lib/r2-client';

export async function GET() {
  return NextResponse.json({ 
    bucketName: R2_CONFIG.bucketName,
    publicUrl: R2_CONFIG.publicUrl,
    hasPlaceholder: R2_CONFIG.publicUrl.includes('pub-your-r2-domain.cloudflare.com')
  });
}