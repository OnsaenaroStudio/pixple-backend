import { NextRequest, NextResponse } from 'next/server';
import { dbGetArticles } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageVal = searchParams.get('page') || '1';
    const page = parseInt(pageVal, 10) || 1;

    const result = await dbGetArticles(page);
    return NextResponse.json({
      page: result.page,
      articles: result.articles
    });
  } catch (err) {
    const error = err as Error;
    console.error("Get articles error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const pageVal = body.page || 1;
    const page = parseInt(String(pageVal), 10) || 1;

    const result = await dbGetArticles(page);
    return NextResponse.json({
      page: result.page,
      articles: result.articles
    });
  } catch (err) {
    const error = err as Error;
    console.error("Get articles error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
