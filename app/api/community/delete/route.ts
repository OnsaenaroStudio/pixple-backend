import { NextRequest, NextResponse } from "next/server";
import { dbDeleteArticle } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const articleIdRaw = body?.article_id;
    const userId = body?.user_id;

    if (articleIdRaw === undefined || articleIdRaw === null) {
      return NextResponse.json(
        { success: false, message: "article_id is required" },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json(
        { success: false, message: "user_id is required" },
        { status: 400 }
      );
    }

    const articleId = Number(articleIdRaw);
    if (!Number.isInteger(articleId) || articleId <= 0) {
      return NextResponse.json(
        { success: false, message: "article_id must be a positive integer" },
        { status: 400 }
      );
    }

    const ok = await dbDeleteArticle(articleId, userId);

    return NextResponse.json(
      { success: ok },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}
