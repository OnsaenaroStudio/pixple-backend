import { NextRequest, NextResponse } from 'next/server';
import { dbCreateComment } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { user_name, user_id, content, article_id } = await request.json();

    if (!user_name || !user_id || !content || !article_id) {
      return NextResponse.json({ 
        is_suc: false, 
        error: "Missing required fields: user_name, user_id, content, article_id" 
      }, { status: 400 });
    }

    const parsedArticleId = parseInt(String(article_id), 10);
    const comment = await dbCreateComment(parsedArticleId, user_name, user_id, content);

    return NextResponse.json({
      is_suc: true,
      comment
    });
  } catch (err) {
    const error = err as Error;
    console.error("Write comment error:", error);
    return NextResponse.json({ is_suc: false, error: error.message }, { status: 500 });
  }
}
