import { NextResponse } from 'next/server';
import { r2Client, R2_CONFIG } from '../../../lib/r2-client';
import { nanoid } from 'nanoid';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function POST(request: Request) {
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
  // Upload file to R2 (simplified; use fetch or stream in production)
  await fetch(signedUrl, { method: 'PUT', body: await file.arrayBuffer() });
  const publicUrl = `${R2_CONFIG.publicUrl}/${key}`;
  return NextResponse.json({ url: publicUrl, key });
}