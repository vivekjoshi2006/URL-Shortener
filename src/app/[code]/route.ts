import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const globalForDb = globalThis as unknown as { localDb?: Map<string, string> };
const localDb = globalForDb.localDb || new Map<string, string>();

const isKvConfigured = !!process.env.KV_REST_API_URL;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> | { code: string } }
) {
  try {
    const resolvedParams = await params;
    const code = resolvedParams.code;

    if (!code) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    let originalUrl: string | null = null;

    // Retrieve from Vercel KV if available, otherwise read from local memory
    if (isKvConfigured) {
      originalUrl = await kv.get<string>(code);
    } else {
      originalUrl = localDb.get(code) || null;
    }

    if (!originalUrl) {
      return NextResponse.redirect(new URL('/?error=not-found', request.url));
    }

    return NextResponse.redirect(originalUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}