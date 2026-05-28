import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/db';

export async function GET() {
  const url = process.env.SUPABASE_URL || "";
  return NextResponse.json({
    supabaseConfigured: isSupabaseConfigured,
    supabaseUrl: isSupabaseConfigured ? url.substring(0, 15) + "..." : null,
    apiKeyConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"),
  });
}
