import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

import {
  isSupabaseConfigured,
  dbGetArticles,
  dbCreateArticle,
  dbGetComments,
  dbCreateComment,
  dbLikeComment,
  dbGetCachedResult,
  dbSetCachedResult,
} from "./src/db.js";

const app = express();
const PORT = 3000;

// Enable JSON body parsing with high limit for base64 images
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Dynamic Gemini Client (Lazy Initialization to prevent startup crash if API key is missing)
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured in your Secrets/Environment variables.");
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

// -------------------------------------------------------------
// 1. /api/gemini-api
// -------------------------------------------------------------
app.post("/api/gemini-api", async (req, res) => {
  try {
    const { img, prompt } = req.body;

    if (!img) {
      return res.status(400).json({ code: 400, error: "Image data (img) is required." });
    }

    // 1. Generate image hash
    const hash = computeHash(img);

    // 2. Check Cache
    const cachedResult = await dbGetCachedResult(hash);
    if (cachedResult) {
       console.log("Serving allergen analysis result from cache!");
       return res.json({
         code: 200,
         data: cachedResult, // returns { allergens: [...] }
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

    // 2. Call Gemini
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
      model: "gemini-3.5-flash",
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

    // 4. Update Cache
    await dbSetCachedResult(hash, finalResult);

    return res.json({
      code: 200,
      data: finalResult,
      cached: false
    });

  } catch (error: any) {
    console.error("Gemini API handler error:", error);
    return res.status(500).json({
      code: 500,
      error: error.message || "An error occurred while calling the food analysis AI."
    });
  }
});

// -------------------------------------------------------------
// 2. /api/community/write
// -------------------------------------------------------------
app.post("/api/community/write", async (req, res) => {
  try {
    const { article_title, article_content, article_hash_tag } = req.body;

    if (!article_title || !article_content) {
      return res.status(400).json({ is_suc: false, error: "Title and content are required." });
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

    return res.json({
      is_suc: true,
      article_id: newId
    });
  } catch (err: any) {
    console.error("Write article error:", err);
    return res.status(500).json({ is_suc: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 3. /api/community (supports GET and POST for maximum resilience)
// -------------------------------------------------------------
const handleGetArticles = async (req: express.Request, res: express.Response) => {
  try {
    // Check both query param (GET) and body param (POST)
    const pageVal = req.query.page || req.body.page || 1;
    const page = parseInt(String(pageVal), 10) || 1;

    const result = await dbGetArticles(page);
    return res.json({
      page: result.page,
      articles: result.articles
    });
  } catch (err: any) {
    console.error("Get articles error:", err);
    return res.status(500).json({ error: err.message });
  }
};
app.get("/api/community", handleGetArticles);
app.post("/api/community", handleGetArticles);

// -------------------------------------------------------------
// 4. /api/community/comment (supports GET and POST)
// -------------------------------------------------------------
const handleGetComments = async (req: express.Request, res: express.Response) => {
  try {
    const articleIdVal = req.query.article_id || req.body.article_id;
    if (!articleIdVal) {
      return res.status(400).json({ error: "article_id is required." });
    }
    const articleId = parseInt(String(articleIdVal), 10);

    const comments = await dbGetComments(articleId);
    return res.json({
      comments
    });
  } catch (err: any) {
    console.error("Get comments error:", err);
    return res.status(500).json({ error: err.message });
  }
};
app.get("/api/community/comment", handleGetComments);
app.post("/api/community/comment", handleGetComments);

// -------------------------------------------------------------
// 5. /api/community/comment/write
// -------------------------------------------------------------
app.post("/api/community/comment/write", async (req, res) => {
  try {
    const { user_name, user_id, content, article_id } = req.body;

    if (!user_name || !user_id || !content || !article_id) {
      return res.status(400).json({ is_suc: false, error: "Missing required fields: user_name, user_id, content, article_id" });
    }

    const parsedArticleId = parseInt(String(article_id), 10);
    const comment = await dbCreateComment(parsedArticleId, user_name, user_id, content);

    return res.json({
      is_suc: true,
      comment
    });
  } catch (err: any) {
    console.error("Write comment error:", err);
    return res.status(500).json({ is_suc: false, error: err.message });
  }
});

// Extra: Comment Liking Endpoint
app.post("/api/community/comment/like", async (req, res) => {
  try {
    const { comment_id } = req.body;
    if (!comment_id) {
      return res.status(400).json({ error: "comment_id is required." });
    }
    const success = await dbLikeComment(parseInt(String(comment_id), 10));
    return res.json({ success });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Connection status API
app.get("/api/db-status", (req, res) => {
  const url = process.env.SUPABASE_URL || "";
  res.json({
    supabaseConfigured: isSupabaseConfigured,
    supabaseUrl: isSupabaseConfigured ? url.substring(0, 15) + "..." : null,
    apiKeyConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"),
  });
});

// -------------------------------------------------------------
// Vite and Static assets configurations
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Let Vite handle frontend routes and compilation in Dev Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted for development mode.");
  } else {
    // Serve production static build
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static distribution assets.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Pixple-backend server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
