import { NextRequest, NextResponse } from 'next/server';
import { dbCreateArticle } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { article_title, article_content, article_hash_tag } = await request.json();

    if (!article_title || !article_content) {
      return NextResponse.json({ is_suc: false, error: "Title and content are required." }, { status: 400 });
    }

    // Ensure hashtags is an array
    let hashtags: string[] = [];
    if (Array.isArray(article_hash_tag)) {
      hashtags = article_hash_tag;
    } else if (typeof article_hash_tag === "string") {
      try {
        hashtags = JSON.parse(article_hash_tag);
      } catch {
        hashtags = article_hash_tag.split(",").map(t => t.trim()).filter(Boolean);
      }
    }

    const newId = await dbCreateArticle(article_title, article_content, hashtags);

    return NextResponse.json({
      is_suc: true,
      article_id: newId
    });
  } catch (err) {
    const error = err as Error;
    console.error("Write article error:", error);
    return NextResponse.json({ is_suc: false, error: error.message }, { status: 500 });
  }
}
