"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  Compass,
  FileText,
  MessageSquare,
  Settings,
  RefreshCw
} from "lucide-react";
import { FOOD_PRESETS, getEndpointsData } from "@/lib/constants";
import type { Article, Comment } from "@/lib/types";

// Import custom sub-components
import Gatekeeper from "@/components/app/Gatekeeper";
import DashboardView from "@/components/app/DashboardView";
import AnalysisApiView from "@/components/app/AnalysisApiView";
import CommunityApiView from "@/components/app/CommunityApiView";
import ApiDocsView from "@/components/app/ApiDocsView";
import SettingsView from "@/components/app/SettingsView";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "analysis_api" | "community_api" | "settings" | "api_docs">("dashboard");

  // Authentication gate state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem("pixple_api_auth") === "true";
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "admin") {
      window.sessionStorage.setItem("pixple_api_auth", "true");
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("올바르지 않은 비밀번호입니다.");
    }
  };

  // Connectivity Status
  const [configStatus, setConfigStatus] = useState({
    supabaseConfigured: false,
    supabaseUrl: null as string | null,
    apiKeyConfigured: false
  });

  const [sessionUser, setSessionUser] = useState({
    name: "PixpleDev",
    id: "dev_" + Math.random().toString(36).substring(2, 7)
  });

  // API Interactive Documentation state
  const [docActiveCategory, setDocActiveCategory] = useState<"all" | "allergens" | "community" | "diagnostics">("all");
  const [docSearchQuery, setDocSearchQuery] = useState("");

  const originUrl = typeof window !== "undefined" ? window.location.origin : "https://api.pixple.com";
  const ENDPOINTS_DATA = getEndpointsData(originUrl);

  const filteredEndpoints = ENDPOINTS_DATA.filter((ep) => {
    if (docActiveCategory !== "all" && ep.category !== docActiveCategory) return false;
    if (docSearchQuery) {
      const query = docSearchQuery.toLowerCase();
      return (
        ep.path.toLowerCase().includes(query) ||
        ep.summary.toLowerCase().includes(query) ||
        ep.description.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Database Stats
  const [analytics, setAnalytics] = useState({
    totalScans: 12482,
    cacheHitsPct: 42.8,
    avgConfidence: 98.4,
    lastAnalyzed: "Bibimbap_Plate_012.jpg"
  });

  // Endpoint Sandbox parameters
  const [selectedPreset, setSelectedPreset] = useState<string | null>("seafood_pajeon");
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState(
    `You are a food allergen detection AI specialized in visual food analysis.

Your task is to analyze a food image and identify possible allergenic ingredients with high precision and minimal false positives.

Internally follow this reasoning process:
1. Identify the dish or food category
2. Detect clearly visible ingredients
3. Infer likely cooking methods
4. Infer likely hidden ingredients commonly used in the identified dish
5. Cross-check inferred ingredients against visible evidence
6. Identify allergenic ingredients from the detected recipe
7. Exclude weak, speculative, or low-confidence assumptions
8. Return only allergenic ingredients with moderate or high confidence

Core detection principles:
- Prefer precision over recall
- Avoid false positives whenever possible
- Do not hallucinate unsupported ingredients
- If uncertain, exclude the ingredient
- Use both visual evidence and culinary knowledge
- Consider regional/common recipes when appropriate
- Infer hidden ingredients only when commonly expected in the identified dish

Carefully consider:
- Sauces
- Marinades
- Broths
- Breading
- Batter
- Oils
- Toppings
- Garnishes
- Noodles
- Dough
- Creams
- Cheese
- Spice mixes
- Seasoning powders
- Processed ingredients
- Condiments
- Stocks
- Fillings

Important topping policy:
- Analyze all visible toppings carefully
- Clearly visible toppings should not be ignored
- Sliced almonds should be identified as almonds when visually distinguishable
- Distinguish specific nuts only when reasonably identifiable
- If exact nut type is unclear but clearly belongs to tree nuts, return "견과류"

Inference examples:
- Fried battered foods may contain 밀가루, 계란, 대두
- Bread and noodles commonly imply 밀가루
- Cream-based sauces may imply 우유
- Soy sauce implies 대두 and possibly 밀가루
- Tempura batter commonly implies 밀가루 and 계란
- Processed meat may contain 대두 or 밀가루 derivatives
- Visible nut toppings should be detected when identifiable

Invalid inference examples:
- Do not assume peanuts unless visually or contextually supported
- Do not assume milk in all baked goods
- Do not infer ingredients solely from vague color or texture
- Do not assume shellfish in every soup
- Do not assume nuts without evidence

Confidence policy:
- Include ingredients only with moderate or high confidence
- Exclude weak possibilities
- Prefer missing uncertain ingredients over returning false positives

Return ONLY valid JSON.

Strict output rules:
- No markdown
- No explanations
- No reasoning text
- No comments
- No code blocks
- No extra text
- Output only a JSON object
- Always return valid JSON
- Remove duplicates
- Sort items alphabetically when possible

Response format:
{
  "allergens": [
    "우유",
    "아몬드",
    "견과류"
  ]
}

If no allergens are confidently detected:
{"allergens":[]}

Use these Korean allergen names:

계란, 우유, 메밀, 땅콩, 대두, 밀, 고등어, 게, 새우, 돼지고기, 복숭아, 토마토, 아황산류, 호두, 닭고기, 소고기, 오징어, 조개류, 잣, 아몬드, 캐슈넛, 피스타치오, 헤이즐넛, 피칸, 마카다미아, 브라질너트, 참깨, 겨자, 샐러리, 키위, 코코넛, 랍스터, 굴, 홍합, 조개, 연어, 참치, 대구, 젤라틴, 귀리, 보리, 호밀, 옥수수, 병아리콩, 렌틸콩, 완두단백, MSG, 인공감미료, 카페인, 견과류, 해산물, 육류, 곡물, 콩류`
  );

  // Playground Outputs
  const [payloadImageResponse, setPayloadImageResponse] = useState<string>("");
  const [imageEndpointStatus, setImageEndpointStatus] = useState<number | null>(null);
  const [imageEndpointLoading, setImageEndpointLoading] = useState(false);

  // Community State & Live Tester variables
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesPage] = useState(1);
  const [articlesLoading, setArticlesLoading] = useState(false);

  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Forms
  const [newPostTitle, setNewPostTitle] = useState("밀가루 없는 파전 제조법 질문");
  const [newPostContent, setNewPostContent] = useState("글루텐프리 밀가루 대체재 추천 부탁드립니다. 쌀가루나 감자전분이 제일 바삭할까요?");
  const [newPostHashtags, setNewPostHashtags] = useState("밀, 글루텐프리, 파전");
  const [postSubmitting, setPostSubmitting] = useState(false);

  const [newCommentText, setNewCommentText] = useState("저는 쌀가루에 감자전분을 7:3 비율로 섞는데 정말 바삭해요!");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // General Status
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Fetch backend connection state
  const refreshConfigStatus = () => {
    fetch("/api/db-status")
      .then(r => r.json())
      .then(data => {
        setConfigStatus(data);
      })
      .catch(err => {
        console.error("Error reading db-status API:", err);
      });
  };

  // Load posts for dashboard & API testing
  const loadDashboardArticles = useCallback(async () => {
    setArticlesLoading(true);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: articlesPage })
      });
      if (res.ok) {
        const body = await res.json();
        setArticles(body.articles || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setArticlesLoading(false);
    }
  }, [articlesPage]);

  useEffect(() => {
    refreshConfigStatus();
    loadDashboardArticles();
  }, [loadDashboardArticles]);

  // Pre-generate food preset canvas on load/select
  useEffect(() => {
    if (selectedPreset) {
      const preset = FOOD_PRESETS.find(f => f.id === selectedPreset);
      if (preset && canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          preset.draw(ctx);
          try {
            setScannedImage(canvasRef.current.toDataURL("image/png"));
          } catch (e) {
            console.error("Preset canvas issue:", e);
          }
        }
      }
    }
  }, [selectedPreset]);

  // Execute /api/gemini-api Analysis
  const runAnalysisAPI = async () => {
    if (!scannedImage) return;
    setImageEndpointLoading(true);
    setImageEndpointStatus(null);
    setPayloadImageResponse("");

    try {
      const res = await fetch("/api/gemini-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          img: scannedImage,
          prompt: customPrompt
        })
      });

      setImageEndpointStatus(res.status);
      const data = await res.json();
      setPayloadImageResponse(JSON.stringify(data, null, 2));

      // Dynamically increment dashboard logs
      setAnalytics(prev => ({
        ...prev,
        totalScans: prev.totalScans + 1,
        lastAnalyzed: selectedPreset ? `${selectedPreset}_Plate.jpg` : "uploaded_capture.jpg"
      }));

    } catch (err) {
      const error = err as Error;
      setImageEndpointStatus(500);
      setPayloadImageResponse(JSON.stringify({ error: error.message || "Failed to contact API" }, null, 2));
    } finally {
      setImageEndpointLoading(false);
    }
  };

  // Submit Article API live demo
  const runCreatePostAPI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    setPostSubmitting(true);
    const parsedTags = newPostHashtags.split(",").map(t => t.trim()).filter(Boolean);

    try {
      const res = await fetch("/api/community/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          article_title: newPostTitle,
          article_content: newPostContent,
          article_hash_tag: parsedTags
        })
      });

      if (res.ok) {
        await loadDashboardArticles();
        setNewPostTitle("");
        setNewPostContent("");
        setNewPostHashtags("");
      } else {
        const errData = await res.json();
        alert("API Error: " + (errData.error || "Failed to create article"));
      }
    } catch (e) {
      const error = e as Error;
      alert("Error: " + error.message);
    } finally {
      setPostSubmitting(false);
    }
  };

  // View an individual post and load its comments
  const handleSelectArticleDetail = async (art: Article) => {
    setActiveArticle(art);
    setCommentsLoading(true);
    try {
      const res = await fetch("/api/community/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article_id: art.id })
      });
      if (res.ok) {
        const body = await res.json();
        setComments(body.comments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Write Comment API live demo
  const runCreateCommentAPI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeArticle) return;

    setCommentSubmitting(true);
    try {
      const res = await fetch("/api/community/comment/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: sessionUser.name,
          user_id: sessionUser.id,
          content: newCommentText,
          article_id: activeArticle.id
        })
      });

      if (res.ok) {
        setNewCommentText("");
        // Reload comments
        handleSelectArticleDetail(activeArticle);
      }
    } catch (e) {
      const error = e as Error;
      alert("Error: " + error.message);
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Like comment live trigger
  const runLikeCommentAPI = async (commentId: number) => {
    try {
      const res = await fetch("/api/community/comment/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_id: commentId })
      });
      if (res.ok) {
        setComments(prev =>
          prev.map(c => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Manual File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedPreset(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setScannedImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const sqlSchemaText = `create table articles (
    id bigint generated always as identity primary key,
    article_title text not null,
    article_content text not null,
    article_hash_tag jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now()
);

create table comments (
    id bigint generated always as identity primary key,
    article_id bigint not null references articles(id) on delete cascade,
    user_name text not null,
    user_id text not null,
    content text not null,
    likes integer not null default 0,
    created_at timestamptz not null default now()
);

create table gemini_cache (
    id bigint generated always as identity primary key,
    image_hash text not null unique,
    result jsonb not null,
    created_at timestamptz not null default now()
);

-- ==========================================
-- ROW-LEVEL SECURITY (RLS) FIX
-- Supabase enables RLS by default. If you see RLS violation errors,
-- choose one of the options below and run it in your SQL Editor:
-- ==========================================

-- Option A: Disable RLS completely (Simplest, recommended for development/sandboxes)
alter table articles disable row level security;
alter table comments disable row level security;
alter table gemini_cache disable row level security;

-- Option B: Keep RLS enabled but allow public/anonymous access
-- alter table articles enable row level security;
-- create policy "Allow public access" on articles for all to public using (true) with check (true);
-- alter table comments enable row level security;
-- create policy "Allow public access" on comments for all to public using (true) with check (true);
-- alter table gemini_cache enable row level security;
-- create policy "Allow public access" on gemini_cache for all to public using (true) with check (true);`;

  if (!isAuthenticated) {
    return (
      <Gatekeeper
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        authError={authError}
        setAuthError={setAuthError}
        handleAuthSubmit={handleAuthSubmit}
      />
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-[#F8F9FA] text-[#1F2937] font-sans">

      {/* Hidden standard square canvas for drawing predefined mock foods */}
      <canvas ref={canvasRef} width={300} height={300} className="hidden" />

      {/* Navigation Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E5E7EB] flex flex-col p-6 shrink-0">

        {/* Brand Block */}
        <div className="flex items-center space-x-3 mb-10">
          <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center shrink-0 shadow-xs">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-[#111827]">Pixple</span>
            <span className="block text-[9px] font-mono tracking-widest text-[#9CA3AF] uppercase">API Backplane</span>
          </div>
        </div>

        {/* Links Navigation */}
        <nav className="flex flex-col space-y-1.5 flex-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left outline-none cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-[#EFF6FF] text-[#1D4ED8]"
                : "text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]"
            }`}
          >
            <Compass size={16} />
            <span>API Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("api_docs")}
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left outline-none cursor-pointer ${
              activeTab === "api_docs"
                ? "bg-[#EFF6FF] text-[#1D4ED8]"
                : "text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]"
            }`}
          >
            <FileText size={16} />
            <span>API Documents</span>
          </button>

          <button
            onClick={() => setActiveTab("analysis_api")}
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left outline-none cursor-pointer ${
              activeTab === "analysis_api"
                ? "bg-[#EFF6FF] text-[#1D4ED8]"
                : "text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]"
            }`}
          >
            <Camera size={16} />
            <span>Image Analysis API</span>
          </button>

          <button
            onClick={() => setActiveTab("community_api")}
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left outline-none cursor-pointer ${
              activeTab === "community_api"
                ? "bg-[#EFF6FF] text-[#1D4ED8]"
                : "text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]"
            }`}
          >
            <MessageSquare size={16} />
            <span>Community Forum API</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left outline-none cursor-pointer ${
              activeTab === "settings"
                ? "bg-[#EFF6FF] text-[#1D4ED8]"
                : "text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]"
            }`}
          >
            <Settings size={16} />
            <span>API Specs & SQL</span>
          </button>
        </nav>

        {/* Database Quick Health Card */}
        <div className="mt-auto p-4 bg-[#F3F4F6] rounded-xl border border-[#E5E7EB]">
          <p className="text-[10px] uppercase tracking-wider font-bold text-[#9CA3AF] mb-2.5">
            Database Status
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  configStatus.supabaseConfigured ? "bg-[#10B981]" : "bg-amber-400"
                }`}
              ></div>
              <span className="font-semibold text-[#374151]">
                {configStatus.supabaseConfigured ? "Supabase Connected" : "Local Sandbox Pool"}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  configStatus.apiKeyConfigured ? "bg-[#10B981]" : "bg-red-400"
                }`}
              ></div>
              <span className="font-semibold text-[#374151]">
                {configStatus.apiKeyConfigured ? "Gemini Service Online" : "Gemini API Key Missing"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg font-bold tracking-tight text-[#111827]">
              {activeTab === "dashboard" && "Pixple Allergen Detection Suite"}
              {activeTab === "api_docs" && "Pixple Developer API References"}
              {activeTab === "analysis_api" && "Allergen Image Analysis Engine"}
              {activeTab === "community_api" && "Community Bulletin Data Plane"}
              {activeTab === "settings" && "Schema DDL & Curl Specs"}
            </h1>
          </div>

          <div className="flex items-center space-x-3 text-xs font-semibold">
            <span className="px-3 py-1.5 bg-[#F3F4F6] rounded-lg text-gray-600 font-mono">
              Session User: <span className="text-[#1D4ED8] font-bold">{sessionUser.name}</span>
            </span>
            <button
              onClick={refreshConfigStatus}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors cursor-pointer outline-none"
              title="Refresh Connection Pool Status"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </header>

        {/* Dynamic Display Panels */}
        <div className="p-8 flex-1 overflow-y-auto">

          {/* VIEW A: OVERVIEW / STATUS DASHBOARD */}
          {activeTab === "dashboard" && (
            <DashboardView
              analytics={analytics}
              configStatus={configStatus}
              setActiveTab={setActiveTab}
              onViewSchemaSpecs={() => setActiveTab("settings")}
            />
          )}

          {/* VIEW B: ALLERGEN SCAN ANALYSIS API PLAYGROUND */}
          {activeTab === "analysis_api" && (
            <AnalysisApiView
              selectedPreset={selectedPreset}
              setSelectedPreset={setSelectedPreset}
              scannedImage={scannedImage}
              handleFileUpload={handleFileUpload}
              customPrompt={customPrompt}
              setCustomPrompt={setCustomPrompt}
              runAnalysisAPI={runAnalysisAPI}
              imageEndpointStatus={imageEndpointStatus}
              imageEndpointLoading={imageEndpointLoading}
              payloadImageResponse={payloadImageResponse}
              copyToClipboard={copyToClipboard}
              copiedText={copiedText}
            />
          )}

          {/* VIEW C: COMMUNITY DISCUSSION & POSTING API TESTER */}
          {activeTab === "community_api" && (
            <CommunityApiView
              articles={articles}
              articlesLoading={articlesLoading}
              activeArticle={activeArticle}
              setActiveArticle={setActiveArticle}
              newPostTitle={newPostTitle}
              setNewPostTitle={setNewPostTitle}
              newPostContent={newPostContent}
              setNewPostContent={setNewPostContent}
              newPostHashtags={newPostHashtags}
              setNewPostHashtags={setNewPostHashtags}
              postSubmitting={postSubmitting}
              runCreatePostAPI={runCreatePostAPI}
              sessionUser={sessionUser}
              setSessionUser={setSessionUser}
              loadDashboardArticles={loadDashboardArticles}
              handleSelectArticleDetail={handleSelectArticleDetail}
              comments={comments}
              commentsLoading={commentsLoading}
              runLikeCommentAPI={runLikeCommentAPI}
              newCommentText={newCommentText}
              setNewCommentText={setNewCommentText}
              commentSubmitting={commentSubmitting}
              runCreateCommentAPI={runCreateCommentAPI}
            />
          )}

          {/* VIEW D: API DOCS PANELS */}
          {activeTab === "api_docs" && (
            <ApiDocsView
              docSearchQuery={docSearchQuery}
              setDocSearchQuery={setDocSearchQuery}
              docActiveCategory={docActiveCategory}
              setDocActiveCategory={setDocActiveCategory}
              filteredEndpoints={filteredEndpoints}
              copyToClipboard={copyToClipboard}
              copiedText={copiedText}
            />
          )}

          {/* VIEW E: SCHEMA DDL SETTINGS */}
          {activeTab === "settings" && (
            <SettingsView
              sqlSchemaText={sqlSchemaText}
              copyToClipboard={copyToClipboard}
              copiedText={copiedText}
            />
          )}

        </div>
      </main>
    </div>
  );
}
