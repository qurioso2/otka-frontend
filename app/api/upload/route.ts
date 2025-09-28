import { NextResponse } from 'next/server';
import { r2Client, R2_CONFIG } from '@/lib/r2-client';
import { nanoid } from 'nanoid';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const key = `${nanoid()}-${file.name}`;
    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: key,
      ContentType: file.type,
    });
    
    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
    
    // Upload file to R2
    const uploadResponse = await fetch(signedUrl, { 
      method: 'PUT', 
      body: await file.arrayBuffer(),
      headers: {
        'Content-Type': file.type,
      }
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
    }

    // Fix the public URL if it has placeholder
    let publicUrl = `${R2_CONFIG.publicUrl}/${key}`;
    if (publicUrl.includes('pub-your-r2-domain.cloudflare.com')) {
      publicUrl = publicUrl.replace('pub-your-r2-domain.cloudflare.com', 'pub-52df54499f9f4836a88ab79b2ff9f8cb.r2.dev');
    }
    
    return NextResponse.json({ url: publicUrl, key });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}