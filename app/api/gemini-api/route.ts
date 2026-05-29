import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { dbGetCachedResult, dbSetCachedResult } from '@/lib/db';

// Dynamic Gemini Client (Lazy Initialization to prevent startup crash if API key is missing)
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;

    console.log(key);
    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured in your environment variables.");
    }
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return geminiClient;
}

// Generate image hash to prevent redundant AI calls and save API quotas
function computeHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const { img, prompt } = await request.json();

    if (!img) {
      return NextResponse.json({ code: 400, error: "Image data (img) is required." }, { status: 400 });
    }

    // 1. Generate image hash
    const hash = computeHash(img);

    // 2. Check Cache
    const cachedResult = await dbGetCachedResult(hash);
    if (cachedResult) {
      console.log("Serving allergen analysis result from cache!");
      return NextResponse.json({
        code: 200,
        data: cachedResult,
        cached: true
      });
    }

    // 3. Process base64 image parts
    let mimeType = "image/png";
    let base64Data = img;

    if (img.includes(";base64,")) {
      const parts = img.split(";base64,");
      const mimePart = parts[0];
      mimeType = mimePart.replace("data:", "");
      base64Data = parts[1];
    }

    // 4. Call Gemini
    const ai = getGeminiClient();

    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };

    const textPart = {
      text: prompt || "Analyze this food allergen image."
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";

    // Clean code block ticks of json response
    let cleanJson = text.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.substring(7);
    }
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.substring(3);
    }
    if (cleanJson.endsWith("```")) {
      cleanJson = cleanJson.substring(0, cleanJson.length - 3);
    }
    cleanJson = cleanJson.trim();

    const resultObj = JSON.parse(cleanJson);
    const allergens = Array.isArray(resultObj.allergens) ? resultObj.allergens : [];

    const finalResult = { allergens };

    // 5. Update Cache
    await dbSetCachedResult(hash, finalResult);

    return NextResponse.json({
      code: 200,
      data: finalResult,
      cached: false
    });

  } catch (error) {
    const err = error as Error;
    console.error("Gemini API handler error:", err);
    return NextResponse.json({
      code: 500,
      error: err.message || "An error occurred while calling the food analysis AI."
    }, { status: 500 });
  }
}
