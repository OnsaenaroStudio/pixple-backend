import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Compass,
  FileText,
  MessageSquare,
  Settings,
  RefreshCw
} from "lucide-react";
import { FOOD_PRESETS, getEndpointsData } from "./constants";
import { Article, Comment } from "./types";

// Import custom sub-components
import Gatekeeper from "./components/Gatekeeper";
import DashboardView from "./components/DashboardView";
import AnalysisApiView from "./components/AnalysisApiView";
import CommunityApiView from "./components/CommunityApiView";
import ApiDocsView from "./components/ApiDocsView";
import SettingsView from "./components/SettingsView";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "analysis_api" | "community_api" | "settings" | "api_docs">("dashboard");

  // Authentication gate state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return typeof window !== "undefined" && window.sessionStorage.getItem("pixple_api_auth") === "true";
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "PIxpleADMIN") {
      window.sessionStorage.setItem("pixple_api_auth", "true");
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("올바르지 않은 비밀번호입니다. (Hint: PIxpleADMIN)");
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
    `Return ONLY a valid JSON object: {"allergens": [<integer codes>]}. No explanation, no markdown. 1=egg, 2=milk, 5=soybean, 6=wheat, 8=crab, 9=shrimp, 12=tomato, 13=sulfites, 14=walnut, 16=beef, 17=squid, 18=shellfish, 19=pine nut.`
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

  useEffect(() => {
    refreshConfigStatus();
    loadDashboardArticles();
  }, []);

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

  // Load posts for dashboard & API testing
  const loadDashboardArticles = async () => {
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
  };

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

    } catch (err: any) {
      setImageEndpointStatus(500);
      setPayloadImageResponse(JSON.stringify({ error: err.message || "Failed to contact API" }, null, 2));
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
    } catch (e: any) {
      alert("Error: " + e.message);
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
    } catch (e: any) {
      alert("Error: " + e.message);
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

            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  configStatus.apiKeyConfigured ? "bg-[#10B981]" : "bg-red-400"
                }`}
              ></div>
              <span className="font-semibold text-[#374151]">
                SUPABASE URL: ${cleanEnvVar(process.env.SUPABASE_URL || "");}
                SUPABASE KEY: ${cleanEnvVar(process.env.SUPABASE_KEY || "");}
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

          {/* VIEW C: COMMUNITY BOARD BULLETIN API PLAYGROUND */}
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

          {/* VIEW E: INTERACTIVE API DOCUMENTS PANEL */}
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

          {/* VIEW D: DATABASE SCHEMAS & CURL DOCS */}
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
