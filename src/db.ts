import { createClient,SupabaseClient  } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { Article, Comment } from "./types";

// Helper to remove any literal leading/trailing quotes from loaded variable strings
const cleanEnvVar = (val: string): string => {
  if (!val) return "";
  let clean = val.trim();
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    clean = clean.substring(1, clean.length - 1);
  }
  return clean.trim();
};

// Read from process.env on server, but allow dynamic override/fallback
const supabaseUrl = cleanEnvVar(process.env.SUPABASE_URL || "");
const supabaseKey = cleanEnvVar(process.env.SUPABASE_KEY || "");

console.log(supabaseUrl);
console.log(supabaseKey);

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey && supabaseUrl !== "MY_SUPABASE_URL" && supabaseUrl !== "");

export let supabase: SupabaseClient<Database> | null = null;

if (isSupabaseConfigured && supabase) {
  try {
    supabase = createClient<Database>(supabaseUrl, supabaseKey);
    console.log("Successfully initialized Supabase with URL:", supabaseUrl);
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
  }
}

// In-Memory fallback store for Sandbox Mode
class SandboxDatabase {
  articles: Article[] = [
    {
      id: 1,
      article_title: "[공지] 한국 식품 알레르기 필수 표시 대상 정보 안내 및 팁",
      article_content: "안녕하세요! Pixple Allergen Detector에 오신 것을 환영합니다.\n\n한국 식품의약품안전처 고시 기준에 따른 한국 의무 표시 대상 알레르기 유래 물질은 총 19종(기타 파생군 포함 20종)입니다.\n식품 분석 시 소스, 분말 등 보이지 않는 알레르기 유입 가능성이 높으므로 음식을 촬영하거나 성분 정보를 검색할 때 확인해 보세요!\n\n이 게시판은 Supabase 또는 로컬 샌드박스로 운영되며 누구나 글과 댓글을 남기실 수 있습니다.",
      article_hash_tag: ["공지", "알레르기정보", "시작하기"],
      created_at: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
    },
    {
      id: 2,
      article_title: "된장찌개 속 알레르기 유발 유입 우려 물질",
      article_content: "된장찌개에는 대두(5번)와 밀(6번) 성분이 국물이나 메주 가공 과정에서 필수적으로 들어가게 됩니다.\n여기에 들어가는 조개(18번)류나 육수용 고기류(16번 쇠고기, 15번 닭고기) 알레르기가 있으신 분들은 식당 등에서 양념 베이스를 꼭 질문해보는 것이 현명합니다.",
      article_hash_tag: ["된장찌개", "한식", "생활꿀팁"],
      created_at: new Date(Date.now() - 3600000 * 5).toISOString() // 5 hours ago
    }
  ];

  comments: Comment[] = [
    {
      id: 1,
      article_id: 1,
      user_name: "안전식단러",
      user_id: "user_01",
      content: "와, 한 눈에 알레르기 성분이 정리되어 있어 정말 마음에 드는 서비스군요!",
      likes: 12,
      created_at: new Date(Date.now() - 3600000 * 20).toISOString()
    },
    {
      id: 2,
      article_id: 2,
      user_name: "민감장트러블",
      user_id: "user_02",
      content: "맞아요, 전 고깃집 된장찌개 먹을 때 항상 쇠고기랑 조개류 알레르기 때문에 골치 아팠는데 정말 훌륭한 팁이네요.",
      likes: 5,
      created_at: new Date(Date.now() - 3600000 * 3).toISOString()
    }
  ];

  cache: Record<string, any> = {};

  async getArticles(page: number = 1, limit: number = 10): Promise<{ page: number; articles: Article[] }> {
    const sorted = [...this.articles].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const start = (page - 1) * limit;
    const paginated = sorted.slice(start, start + limit);
    return {
      page,
      articles: paginated
    };
  }

  async createArticle(title: string, content: string, hashtags: string[]): Promise<number> {
    const newId = this.articles.length > 0 ? Math.max(...this.articles.map(a => a.id)) + 1 : 1;
    const newArticle: Article = {
      id: newId,
      article_title: title,
      article_content: content,
      article_hash_tag: hashtags,
      created_at: new Date().toISOString()
    };
    this.articles.push(newArticle);
    return newId;
  }

  async getComments(articleId: number): Promise<Comment[]> {
    return this.comments
      .filter(c => c.article_id === articleId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async createComment(articleId: number, userName: string, userId: string, content: string): Promise<Comment> {
    const newId = this.comments.length > 0 ? Math.max(...this.comments.map(c => c.id)) + 1 : 1;
    const newComment: Comment = {
      id: newId,
      article_id: articleId,
      user_name: userName,
      user_id: userId,
      content,
      likes: 0,
      created_at: new Date().toISOString()
    };
    this.comments.push(newComment);
    return newComment;
  }

  async likeComment(commentId: number): Promise<boolean> {
    const comment = this.comments.find(c => c.id === commentId);
    if (comment) {
      comment.likes += 1;
      return true;
    }
    return false;
  }

  async getCachedResult(hash: string): Promise<any | null> {
    return this.cache[hash] || null;
  }

  async setCachedResult(hash: string, result: any): Promise<void> {
    this.cache[hash] = result;
  }
}

export const sandboxDb = new SandboxDatabase();

// Centralized database fetch helper supporting either real Supabase or Sandbox Mode
export async function dbGetArticles(page: number): Promise<{ page: number; articles: Article[] }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const limit = 10;
      const start = (page - 1) * limit;
      const end = start + limit - 1;

      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false })
        .range(start, end);

      if (error) throw error;

      // Map Supabase article_hash_tag (might be JSON string or array already)
      const mappedArticles = (data || []).map((art: any) => ({
        ...art,
        article_hash_tag: Array.isArray(art.article_hash_tag)
          ? art.article_hash_tag
          : typeof art.article_hash_tag === "string"
          ? JSON.parse(art.article_hash_tag)
          : art.article_hash_tag || []
      }));

      return { page, articles: mappedArticles };
    } catch (err: any) {
      console.error("Supabase Error (dbGetArticles):", err.message);
      throw new Error(`Supabase Query Failed for 'articles': ${err.message}. Please check if the tables are created in Supabase SQL editor using the Schema blueprints!`);
    }
  }
  return sandboxDb.getArticles(page);
}

export async function dbCreateArticle(title: string, content: string, hashtags: string[]): Promise<number | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("articles")
        .insert([{
          article_title: title,
          article_content: content,
          article_hash_tag: hashtags
        }])
        .select("id")
        .single();

      if (error) throw error;
      return data.id;
    } catch (err: any) {
      console.error("Supabase Error (dbCreateArticle):", err.message);
      throw new Error(`Supabase Insert Failed for 'articles': ${err.message}. Please check if the tables are created in Supabase SQL editor using the Schema blueprints!`);
    }
  }
  return sandboxDb.createArticle(title, content, hashtags);
}

export async function dbGetComments(articleId: number): Promise<Comment[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("article_id", articleId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error("Supabase Error (dbGetComments):", err.message);
      throw new Error(`Supabase Query Failed for 'comments': ${err.message}. Please check if the tables are created in Supabase SQL editor using the Schema blueprints!`);
    }
  }
  return sandboxDb.getComments(articleId);
}

export async function dbCreateComment(articleId: number, userName: string, userId: string, content: string): Promise<Comment | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          article_id: articleId,
          user_name: userName,
          user_id: userId,
          content,
          likes: 0
        })
        .select("*")
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error("Supabase Error (dbCreateComment):", err.message);
      throw new Error(`Supabase Insert Failed for 'comments': ${err.message}. Please check if the tables are created in Supabase SQL editor using the Schema blueprints!`);
    }
  }
  return sandboxDb.createComment(articleId, userName, userId, content);
}

export async function dbLikeComment(commentId: number): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      // Get current likes
      const { data: comment, error: fetchErr } = await supabase
        .from("comments")
        .select("likes")
        .eq("id", commentId)
        .single();

      if (fetchErr) throw fetchErr;

      const { error: updateErr } = await supabase
        .from("comments")
        .update({ likes: (comment?.likes || 0) + 1 })
        .eq("id", commentId);

      if (updateErr) throw updateErr;
      return true;
    } catch (err: any) {
      console.error("Supabase Error (dbLikeComment):", err.message);
      throw new Error(`Supabase Update Failed for 'comments' likes: ${err.message}.`);
    }
  }
  return sandboxDb.likeComment(commentId);
}

export async function dbGetCachedResult(imageHash: string): Promise<any | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("gemini_cache")
        .select("result")
        .eq("image_hash", imageHash)
        .maybeSingle();

      if (error) throw error;
      return data ? data.result : null;
    } catch (err: any) {
      console.error("Supabase Error (dbGetCachedResult):", err.message);
      throw new Error(`Supabase Query Failed for 'gemini_cache': ${err.message}. Please make sure 'gemini_cache' table is provisioned!`);
    }
  }
  return sandboxDb.getCachedResult(imageHash);
}

export async function dbSetCachedResult(imageHash: string, result: any): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from("gemini_cache")
        .upsert({
          image_hash: imageHash,
          result: result
        }, { onConflict: "image_hash" });

      if (error) throw error;
    } catch (err: any) {
      console.error("Supabase Error (dbSetCachedResult):", err.message);
      throw new Error(`Supabase Upsert Failed for 'gemini_cache': ${err.message}.`);
    }
  } else {
    sandboxDb.setCachedResult(imageHash, result);
  }
}
