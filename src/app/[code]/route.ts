import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

function generateSlug(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function POST(request: NextRequest) {
  try {
    const { url } = (await request.json()) as { url?: string };

    if (!url) {
      return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    let slug = generateSlug();
    
    // Ensure slug uniqueness by checking Vercel KV database
    while (await kv.get(slug)) {
      slug = generateSlug();
    }

    // Save the key-value pair directly in Vercel's KV database
    await kv.set(slug, url);

    return NextResponse.json({ code: slug });
  } catch (error) {
    console.error('Shorten API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
