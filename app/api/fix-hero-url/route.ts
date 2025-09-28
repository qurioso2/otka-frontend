import { getServerSupabase } from '@/app/auth/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await getServerSupabase();
    
    // Get the current OG image with wrong URL
    const { data: currentImage, error: fetchError } = await supabase
      .from('public_assets')
      .select('*')
      .eq('active', true)
      .eq('type', 'og')
      .maybeSingle();
    
    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    
    if (!currentImage) {
      return NextResponse.json({ error: 'No active OG image found' }, { status: 404 });
    }
    
    // Fix the URL by replacing the placeholder domain
    const oldUrl = currentImage.url;
    const correctUrl = oldUrl.replace(
      'pub-your-r2-domain.cloudflare.com',
      'pub-52df54499f9f4836a88ab79b2ff9f8cb.r2.dev'
    );
    
    if (oldUrl === correctUrl) {
      return NextResponse.json({ 
        message: 'URL is already correct',
        url: correctUrl 
      });
    }
    
    // Update the URL in database
    const { error: updateError } = await supabase
      .from('public_assets')
      .update({ url: correctUrl })
      .eq('id', currentImage.id);
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'URL fixed successfully',
      oldUrl,
      newUrl: correctUrl 
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}