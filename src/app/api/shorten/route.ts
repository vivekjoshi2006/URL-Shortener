import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// Global in-memory fallback for local testing if Vercel KV is not connected
const globalForDb = globalThis as unknown as { localDb?: Map<string, string> };
if (!globalForDb.localDb) {
  globalForDb.localDb = new Map<string, string>();
}
const localDb = globalForDb.localDb;

// Check if Vercel KV credentials exist in .env
const isKvConfigured = !!process.env.KV_REST_API_URL;

function generateSlug(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: Request) {
  try {
    const { url } = (await request.json()) as { url?: string };

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
      new URL(url);
    } catch (_) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    let code = generateSlug();
    let exists = false;

    // Use Vercel KV if available, otherwise check local memory map
    if (isKvConfigured) {
      exists = !!(await kv.get(code));
    } else {
      exists = localDb.has(code);
    }

    let attempts = 0;
    while (exists && attempts < 5) {
      code = generateSlug();
      if (isKvConfigured) {
        exists = !!(await kv.get(code));
      } else {
        exists = localDb.has(code);
      }
      attempts++;
    }

    // Save mapping
    if (isKvConfigured) {
      await kv.set(code, url);
    } else {
      localDb.set(code, url);
      console.warn('⚠️ Vercel KV is not configured. Saved URL to local memory instead.');
    }

    return NextResponse.json({ code });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}