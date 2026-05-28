import { NextRequest, NextResponse } from 'next/server';
import { dbGetComments } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleIdVal = searchParams.get('article_id');
    
    if (!articleIdVal) {
      return NextResponse.json({ error: "article_id is required." }, { status: 400 });
    }
    
    const articleId = parseInt(articleIdVal, 10);
    const comments = await dbGetComments(articleId);
    
    return NextResponse.json({ comments });
  } catch (err) {
    const error = err as Error;
    console.error("Get comments error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const articleIdVal = body.article_id;
    
    if (!articleIdVal) {
      return NextResponse.json({ error: "article_id is required." }, { status: 400 });
    }
    
    const articleId = parseInt(String(articleIdVal), 10);
    const comments = await dbGetComments(articleId);
    
    return NextResponse.json({ comments });
  } catch (err) {
    const error = err as Error;
    console.error("Get comments error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
