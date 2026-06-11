import { NextRequest, NextResponse } from "next/server";
import { dbDeleteComment } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const commentIdRaw = body?.comment_id;

    if (commentIdRaw === undefined || commentIdRaw === null) {
      return NextResponse.json(
        { success: false, message: "comment_id is required" },
        { status: 400 }
      );
    }

    const commentId = Number(commentIdRaw);
    if (!Number.isInteger(commentId) || commentId <= 0) {
      return NextResponse.json(
        { success: false, message: "comment_id must be a positive integer" },
        { status: 400 }
      );
    }

    const ok = await dbDeleteComment(commentId);

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
