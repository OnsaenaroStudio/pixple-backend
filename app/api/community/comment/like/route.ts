import { NextRequest, NextResponse } from 'next/server';
import { dbLikeComment } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { comment_id } = await request.json();
    
    if (!comment_id) {
      return NextResponse.json({ error: "comment_id is required." }, { status: 400 });
    }
    
    const success = await dbLikeComment(parseInt(String(comment_id), 10));
    return NextResponse.json({ success });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
