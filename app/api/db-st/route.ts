import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL?.trim() || null;
  const supabaseKey = process.env.SUPABASE_KEY?.trim() || "";
  const geminiKey = process.env.GEMINI_API_KEY?.trim() || "";

  const supabaseConfigured = Boolean(supabaseUrl && supabaseKey);
  const apiKeyConfigured = Boolean(geminiKey);

  const maskedKeyPreview = supabaseKey
    ? `${supabaseKey.slice(0, 4)}••••${supabaseKey.slice(-4)}`
    : null;

  let dbReachable = false;
  if (supabaseConfigured) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: "GET",
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
        cache: "no-store",
      });
      dbReachable = res.ok || res.status === 401 === false ? res.ok : false;
      dbReachable = res.status < 500;
    } catch {
      dbReachable = false;
    }
  }

  return NextResponse.json({
    supabaseConfigured,
    supabaseUrl,
    apiKeyConfigured,
    maskedKeyPreview,
    dbReachable,
    checkedAt: new Date().toISOString(),
  });
}
