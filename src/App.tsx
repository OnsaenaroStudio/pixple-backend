import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Upload,
  ShieldCheck,
  ShieldAlert,
  MessageSquare,
  Plus,
  Heart,
  ChevronRight,
  Image as ImageIcon,
  Settings,
  AlertCircle,
  Calendar,
  Hash,
  User,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  Terminal,
  Play,
  FileText,
  Database,
  Lock,
  Compass,
  CheckCircle,
  ThumbsUp
} from "lucide-react";
import { ALLERGENS_MAP, Article, Comment, AllergenInfo } from "./types";

interface FoodPreset {
  id: string;
  name: string;
  description: string;
  allergens: number[];
  bgColor: string;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

const FOOD_PRESETS: FoodPreset[] = [
  {
    id: "seafood_pajeon",
    name: "해물파전 (Seafood Pancake)",
    description: "새우, 오징어, 조개류 등의 해산물과 밀가루, 계란이 들어간 전통 파전",
    allergens: [1, 6, 9, 17, 18], // egg, wheat, shrimp, squid, shellfish
    bgColor: "bg-amber-50",
    draw: (ctx) => {
      ctx.fillStyle = "#eab308";
      ctx.beginPath();
      ctx.arc(150, 150, 100, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 10;
      ctx.strokeStyle = "#16a34a";
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(90, 80 + i * 36);
        ctx.lineTo(210, 100 + i * 28);
        ctx.stroke();
      }
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(120, 110, 15, 0, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(170, 160, 15, 1, Math.PI + 1);
      ctx.stroke();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(150, 120, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.ellipse(140, 170, 6, 15, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#451a03";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("HAEMUL PAJEON PRESET", 60, 275);
    }
  },
  {
    id: "doenjang_jjigae",
    name: "해물 된장찌개 (Soybean Paste Stew)",
    description: "전통 된장을 풀고 조개류, 게, 대두 두부를 기본으로 끓인 얼큰한 한식 찌개",
    allergens: [5, 8, 18], // soybean, crab, shellfish
    bgColor: "bg-orange-50",
    draw: (ctx) => {
      ctx.fillStyle = "#57534e";
      ctx.beginPath();
      ctx.arc(150, 140, 95, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#854d0e";
      ctx.beginPath();
      ctx.arc(150, 140, 85, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fcfaf2";
      ctx.fillRect(95, 110, 30, 30);
      ctx.fillRect(145, 95, 28, 28);
      ctx.fillStyle = "#ea580c";
      ctx.beginPath();
      ctx.moveTo(110, 150);
      ctx.lineTo(150, 170);
      ctx.lineTo(120, 180);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#86efac";
      ctx.beginPath();
      ctx.arc(170, 140, 18, 0, Math.PI);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#15803d";
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("DOENJANG JJIGAE PRESET", 65, 270);
    }
  }
];

const ENDPOINTS_DATA = [
  {
    id: "db_status",
    method: "GET",
    path: "/api/db-status",
    category: "diagnostics",
    summary: "시스템 진단 및 DB 연동 점검",
    description: "인스턴스 구동 초기화 및 환경설정 연동 여부를 취합하는 엔드포인트입니다. Supabase 및 Gemini 인공지능 모듈이 활성화되어 정상적인 질의를 수락할 수 있는 상태인지 검증합니다.",
    headers: [
      { name: "Accept", value: "application/json", required: true }
    ],
    parameters: [],
    curlExample: 'curl -X GET "' + (typeof window !== "undefined" ? window.location.origin : "https://api.pixple.com") + '/api/db-status" \\\n  -H "Accept: application/json"',
    responseExample: JSON.stringify({
      supabaseConfigured: true,
      supabaseUrl: "https://gkqwobunp...supabase.co",
      apiKeyConfigured: true
    }, null, 2),
    responseDesc: "supabaseConfigured: 데이터베이스 어댑터 연결 상태, apiKeyConfigured: Google AI Studio Gemini API 키 등록 완료 상태."
  },
  {
    id: "gemini_api",
    method: "POST",
    path: "/api/gemini-api",
    category: "allergens",
    summary: "음식 사진 인공지능 알레르기 분석 원본",
    description: "이미지 원본 Base64 바이너리를 인공지능 모델에 전달해 알레르기 수치를 안전하게 도출합니다. 동일 이미지 해시에 대해서 데이터베이스 캐싱 계층이 자동 동작하여 AI 할당량 낭비를 최적화합니다.",
    headers: [
      { name: "Content-Type", value: "application/json", required: true }
    ],
    parameters: [
      { name: "img", type: "string", required: true, desc: "분석 대상 음식 접시 사진의 Base64 인코딩 스트링 (디렉토리 및 data: 형식 수락)" },
      { name: "prompt", type: "string", required: false, default: "ALLERGENS_MAP 식별 요청", desc: "검출 프로세스를 정의할 AI 가이드라인 지시문" }
    ],
    curlExample: 'curl -X POST ' + (typeof window !== "undefined" ? window.location.origin : "https://api.pixple.com") + '/api/gemini-api \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "img": "data:image/png;base64,iVBORw...",\n    "prompt": "Return ONLY valid JSON allergens list."\n  }\'',
    responseExample: JSON.stringify({
      code: 200,
      data: {
        allergens: [1, 6, 9, 18]
      },
      cached: false
    }, null, 2),
    responseDesc: "code: HTTP 결과 상태, data.allergens: 감지된 항원성 인덱스 수치 목록 (각각의 코드가 계란, 대두, 조개류 등에 매핑됨), cached: 응답이 DB 캐시에서 복원되었는가 여부."
  },
  {
    id: "community_get",
    method: "GET",
    path: "/api/community",
    category: "community",
    summary: "커뮤니티 토론 게시물 리스트",
    description: "데이터베이스 통합 Bulletin Board 보드의 스레드 리스트들을 페이지 규격 지표에 따라서 안전하게 호출합니다. (POST 요청 역시 동일한 구조로 중복 수락됩니다.)",
    headers: [
      { name: "Accept", value: "application/json", required: true }
    ],
    parameters: [
      { name: "page", type: "integer", required: false, default: "1", desc: "조회할 페이징 넘버 번호" }
    ],
    curlExample: 'curl -X GET "' + (typeof window !== "undefined" ? window.location.origin : "https://api.pixple.com") + '/api/community?page=1" \\\n  -H "Accept: application/json"',
    responseExample: JSON.stringify({
      page: 1,
      articles: [
        {
          id: 21,
          article_title: "메밀 대체 전분 질문",
          article_content: "메밀가루 100% 대신 무엇을 섞어야 반죽 조직에 탄력이 생길까요?",
          article_hash_tag: ["메밀", "밀가루알레르기", "베이킹"],
          created_at: "2026-05-28T02:00:00Z"
        }
      ]
    }, null, 2),
    responseDesc: "page: 결과 출력 페이지 번호, articles: 게시물 개체 배열 (id, title, content, hashtags, 작성시간)."
  },
  {
    id: "community_write",
    method: "POST",
    path: "/api/community/write",
    category: "community",
    summary: "커뮤니티 신규 질의 스레드 개설",
    description: "커뮤니티 상호 소통을 촉진할 수 있는 새로운 토픽을 등록합니다. 해시태그 정보는 기입시 JSONB 스키마 인덱싱을 타서 정합성 있게 보존됩니다.",
    headers: [
      { name: "Content-Type", value: "application/json", required: true }
    ],
    parameters: [
      { name: "article_title", type: "string", required: true, desc: "등록할 글제목" },
      { name: "article_content", type: "string", required: true, desc: "등록질의 본문" },
      { name: "article_hash_tag", type: "array / string", required: false, desc: "해시태그 모음 배열 혹은 쉼표(,) 구분 스트링 데이터" }
    ],
    curlExample: 'curl -X POST ' + (typeof window !== "undefined" ? window.location.origin : "https://api.pixple.com") + '/api/community/write \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "article_title": "대두 단백질 대체품 질문",\n    "article_content": "콩 알레르기가 심한 영아용 산양유 섭취 가이드를 여쭙니다.",\n    "article_hash_tag": ["대두", "영아", "산양유"]\n  }\'',
    responseExample: JSON.stringify({
      is_suc: true,
      article_id: 22
    }, null, 2),
    responseDesc: "is_suc: 게시 등록 완료 여부 플래그, article_id: 할당받은 게시물 고유 번호."
  },
  {
    id: "comment_get",
    method: "GET",
    path: "/api/community/comment",
    category: "community",
    summary: "게시글 타겟 실시간 댓글 로드",
    description: "특정 타겟 게시글 외래키 식별 정보를 기준으로 작성 수렴된 서브 댓글 피드를 로딩합니다.",
    headers: [
      { name: "Accept", value: "application/json", required: true }
    ],
    parameters: [
      { name: "article_id", type: "integer", required: true, desc: "타겟 매칭 부모 게시글 고유 ID 코드" }
    ],
    curlExample: 'curl -X GET "' + (typeof window !== "undefined" ? window.location.origin : "https://api.pixple.com") + '/api/community/comment?article_id=21" \\\n  -H "Accept: application/json"',
    responseExample: JSON.stringify({
      comments: [
        {
          id: 114,
          article_id: 21,
          user_name: "NutritionExpert",
          user_id: "user_a89",
          content: "타피오카 전분 전용 대체재를 30% 혼입하시면 점성이 배가됩니다.",
          likes: 12,
          created_at: "2026-05-28T02:01:00Z"
        }
      ]
    }, null, 2),
    responseDesc: "comments: 해당 글에 작성된 댓글 개체 정보 목록 (Likes 수치, 작성 유저 아이디 조합 포함)."
  },
  {
    id: "comment_write",
    method: "POST",
    path: "/api/community/comment/write",
    category: "community",
    summary: "신규 토론 피드백 댓글 등록",
    description: "질문을 제기한 스레드에 해법 댓글 리소스를 등록하여 릴레이를 연결합니다.",
    headers: [
      { name: "Content-Type", value: "application/json", required: true }
    ],
    parameters: [
      { name: "user_name", type: "string", required: true, desc: "댓글 유저 닉네임" },
      { name: "user_id", type: "string", required: true, desc: "고유 일회용 난수화된 디바이스 ID 코드" },
      { name: "content", type: "string", required: true, desc: "코멘트 상세 본문" },
      { name: "article_id", type: "integer", required: true, desc: "댓글을 등록할 부모 게시글 주키 코드식별값" }
    ],
    curlExample: 'curl -X POST ' + (typeof window !== "undefined" ? window.location.origin : "https://api.pixple.com") + '/api/community/comment/write \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "user_name": "HomeBaker",\n    "user_id": "dev_3c92",\n    "content": "차전자피 가루가 글루텐 끈기를 상당 부분 살려줍니다.",\n    "article_id": 21\n  }\'',
    responseExample: JSON.stringify({
      is_suc: true,
      comment: {
        id: 115,
        article_id: 21,
        user_name: "HomeBaker",
        content: "차전자피 가루가 글루텐 끈기를 상당 부분 살려줍니다.",
        likes: 0,
        created_at: "2026-05-28T02:05:00Z"
      }
    }, null, 2),
    responseDesc: "is_suc: 등록 성공 판단 데이터, comment: 즉각 추가 적용된 신규 생성 댓글 데이터 본체."
  },
  {
    id: "comment_like",
    method: "POST",
    path: "/api/community/comment/like",
    category: "community",
    summary: "댓글 유용성 추천 (좋아요 가산)",
    description: "솔루션이 유용할 때 카운트 수치를 올려 동기 부여 평가 점수에 직접 가산합니다.",
    headers: [
      { name: "Content-Type", value: "application/json", required: true }
    ],
    parameters: [
      { name: "comment_id", type: "integer", required: true, desc: "가중치 추천을 적용하여 갱신할 대상 코멘트 고유식별 값" }
    ],
    curlExample: 'curl -X POST ' + (typeof window !== "undefined" ? window.location.origin : "https://api.pixple.com") + '/api/community/comment/like \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "comment_id": 115\n  }\'',
    responseExample: JSON.stringify({
      success: true
    }, null, 2),
    responseDesc: "success: 트랜잭션 수치 갱신 성공 여부."
  }
];

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
  const [isCachedImage, setIsCachedImage] = useState(false);

  // Community State & Live Tester variables
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesPage, setArticlesPage] = useState(1);
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
      const start = Date.now();
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
      setIsCachedImage(!!data.cached);

      // Dynamically increment dashboard logs
      const end = Date.now();
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
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0F172A] text-slate-100 flex-col p-6 font-sans relative overflow-hidden select-none">
        {/* Background Ambient Lights */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Gate Container */}
        <div className="w-full max-w-md bg-slate-900 border border-slate-850 rounded-2xl p-8 relative z-10 shadow-2xl flex flex-col items-center">
          
          {/* Animated Lock Icon Portal */}
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex items-center justify-center mb-6 relative animate-pulse">
            <Lock className="text-blue-400 w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white mb-2 text-center">Pixple API Gatekeeper</h2>
          <p className="text-xs text-slate-400 text-center mb-8 max-w-sm leading-relaxed">
            보안 유지를 위해 개발 리소스 및 API Sandbox 접근이 차단되어 있습니다. 계속하려면 승인된 비밀번호를 입력해주세요.
          </p>

          <form onSubmit={handleAuthSubmit} className="w-full space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Security Password
              </label>
              <input
                type="password"
                placeholder="비밀번호 입력..."
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (authError) setAuthError("");
                }}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                autoFocus
                required
              />
            </div>

            {authError && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-100 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-normal text-red-300">{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/15"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Gateway Credentials</span>
            </button>
          </form>

          {/* Quick Credential Tip for sandbox administrators */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 w-full flex items-center justify-between text-[10px] text-slate-500">
            <span>Server Instance: Live-2026</span>
            <span className="font-mono bg-slate-950 px-2 py-1 rounded text-blue-400/90 border border-slate-800">Default: PIxpleADMIN</span>
          </div>

        </div>
      </div>
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
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left outline-none ${
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
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left outline-none ${
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
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left outline-none ${
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
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left outline-none ${
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
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left outline-none ${
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
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
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
            <div className="space-y-6">
              
              {/* Stat Bento Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E5E7EB] p-5 rounded-2xl">
                  <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-1">Total API Scans</p>
                  <p className="text-2xl font-bold font-mono text-[#111827]">{analytics.totalScans.toLocaleString()}</p>
                </div>
                <div className="bg-white border border-[#E5E7EB] p-5 rounded-2xl">
                  <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-1">Cache Hit Efficiency</p>
                  <p className="text-2xl font-bold font-mono text-[#111827]">{analytics.cacheHitsPct}%</p>
                </div>
                <div className="bg-white border border-[#E5E7EB] p-5 rounded-2xl">
                  <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-1">Model Precision</p>
                  <p className="text-2xl font-bold font-mono text-[#111827]">{analytics.avgConfidence}%</p>
                </div>
                <div className="bg-white border border-[#E5E7EB] p-5 rounded-2xl bg-[#EFF6FF]/40 border-[#EFF6FF]">
                  <p className="text-[10px] text-[#1D4ED8] font-bold uppercase tracking-wider mb-1">Active Model</p>
                  <p className="text-sm font-bold text-[#1D4ED8] mt-1">gemini-3.5-flash</p>
                </div>
              </div>

              {/* Main Information Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left side column: Active specifications */}
                <div className="lg:col-span-8 space-y-6">
                  
                  <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-bold text-[#111827] text-base">Pixple API Endpoint Registry</h2>
                      <span className="text-xs text-[#6B7280] font-medium font-mono">Status: active</span>
                    </div>

                    <div className="space-y-3">
                      {/* Endpoint list item */}
                      <div
                        onClick={() => setActiveTab("analysis_api")}
                        className="flex items-center justify-between p-4 border border-[#F3F4F6] rounded-xl hover:bg-[#FAFAFA] hover:border-gray-200 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-mono font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200">
                            POST
                          </span>
                          <div>
                            <p className="text-sm font-bold text-[#111827]">/api/gemini-api</p>
                            <p className="text-xs text-[#9CA3AF]">Extract food allergens from payload images via Google AI</p>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-[#9CA3AF] group-hover:translate-x-1 transition-transform" />
                      </div>

                      {/* Endpoint list item */}
                      <div
                        onClick={() => setActiveTab("community_api")}
                        className="flex items-center justify-between p-4 border border-[#F3F4F6] rounded-xl hover:bg-[#FAFAFA] hover:border-gray-200 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-mono font-bold bg-[#E5E7EB] text-[#374151] px-2 py-0.5 rounded border border-[#CBD5E1]">
                            POST
                          </span>
                          <div>
                            <p className="text-sm font-bold text-[#111827]">/api/community/write</p>
                            <p className="text-xs text-[#9CA3AF]">Publish a new discussion topic to the backend pool</p>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-[#9CA3AF] group-hover:translate-x-1 transition-transform" />
                      </div>

                      {/* Endpoint list item */}
                      <div
                        onClick={() => setActiveTab("community_api")}
                        className="flex items-center justify-between p-4 border border-[#F3F4F6] rounded-xl hover:bg-[#FAFAFA] hover:border-gray-200 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                            GET
                          </span>
                          <div>
                            <p className="text-sm font-bold text-[#111827]">/api/community</p>
                            <p className="text-xs text-[#9CA3AF]">Query discussion topics with pagination filters</p>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-[#9CA3AF] group-hover:translate-x-1 transition-transform" />
                      </div>

                      {/* Endpoint list item */}
                      <div
                        onClick={() => setActiveTab("community_api")}
                        className="flex items-center justify-between p-4 border border-[#F3F4F6] rounded-xl hover:bg-[#FAFAFA] hover:border-gray-200 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-mono font-bold bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded border border-yellow-200">
                            POST
                          </span>
                          <div>
                            <p className="text-sm font-bold text-[#111827]">/api/community/comment/write</p>
                            <p className="text-xs text-[#9CA3AF]">Add comments directly linked with a specific article identity</p>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-[#9CA3AF] group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Integration checklist */}
                  <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                    <h3 className="font-bold text-[#111827] text-base mb-3">API Environment Guide</h3>
                    <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
                      The core backplane allows seamless connection with Supabase (Database Layer) and Gemini Pro (AI Layer) for allergen analyses. Enable these capabilities by registering environment variables.
                    </p>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded-xl border border-[#F3F4F6]">
                        <span className="text-xs font-bold font-mono text-[#374151]">SUPABASE_URL</span>
                        <span className="text-xs text-[#9CA3AF]">
                          {configStatus.supabaseConfigured ? "✓ Configured (Connected)" : "Missing from environment"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded-xl border border-[#F3F4F6]">
                        <span className="text-xs font-bold font-mono text-[#374151]">SUPABASE_ANON_KEY</span>
                        <span className="text-xs text-[#9CA3AF]">
                          {configStatus.supabaseConfigured ? "✓ Configured (Active)" : "Missing from environment"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded-xl border border-[#F3F4F6]">
                        <span className="text-xs font-bold font-mono text-[#374151]">GEMINI_API_KEY</span>
                        <span className="text-xs text-[#9CA3AF]">
                          {configStatus.apiKeyConfigured ? "✓ Configured (Connected)" : "Using playground simulated values"}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right side column: Live Quick Analytics logs */}
                <div className="lg:col-span-4">
                  <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 h-full flex flex-col">
                    <div className="pb-4 border-b border-[#F3F4F6] flex justify-between items-center mb-4">
                      <h3 className="font-bold text-[#111827]">Live Access Logs</h3>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">POOL LIVE</span>
                    </div>

                    <div className="space-y-4 flex-1">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono font-bold text-gray-500">POST /api/gemini-api</span>
                          <span className="text-[10px] text-green-500 font-bold">200 OK</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-tight">Matched preset image {analytics.lastAnalyzed}.</p>
                        <p className="text-[10px] text-gray-400">Time: Just now</p>
                      </div>

                      <div className="space-y-1 border-t border-gray-50 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono font-bold text-gray-500">POST /api/community</span>
                          <span className="text-[10px] text-green-500 font-bold">200 OK</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-tight">Returned active bullet topics feed.</p>
                        <p className="text-[10px] text-gray-400">Time: 1m ago</p>
                      </div>

                      <div className="space-y-1 border-t border-gray-50 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono font-bold text-gray-500">GET /api/db-status</span>
                          <span className="text-[10px] text-green-500 font-bold">200 OK</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-tight">Connectivity diagnostics ping executed.</p>
                        <p className="text-[10px] text-gray-400">Time: System mount</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab("settings")}
                      className="w-full mt-6 py-2.5 bg-[#111827] text-white text-xs font-bold rounded-xl hover:bg-stone-800 transition-colors uppercase tracking-wider"
                    >
                      View Source Schema specs
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* VIEW B: ALLERGEN SCAN ANALYSIS API PLAYGROUND */}
          {activeTab === "analysis_api" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Sandbox Settings panel */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                  <h3 className="font-bold text-[#111827] text-base mb-1.5 flex items-center gap-1.5">
                    ⚙️ Request Parameters
                  </h3>
                  <p className="text-xs text-[#6B7280] mb-5">
                    Select a high-resolution food preset or upload your custom image to package inside the base64 JSON payload.
                  </p>

                  {/* Preset Choose */}
                  <div className="mb-4">
                    <span className="block text-[10px] uppercase tracking-wider font-extrabold text-[#9CA3AF] mb-2">
                      Template Image presets
                    </span>
                    <div className="space-y-1.5">
                      {FOOD_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {{ setSelectedPreset(p.id); }}}
                          className={`w-full p-3 rounded-lg border text-left transition-all ${
                            selectedPreset === p.id
                              ? "border-[#3B82F6] bg-[#EFF6FF] text-[#1D4ED8]"
                              : "border-gray-200 bg-white hover:bg-gray-50 text-[#374151]"
                          }`}
                        >
                          <div className="text-xs font-bold">{p.name}</div>
                          <div className="text-[10px] text-[#6B7280] truncate mt-0.5">{p.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Manual file select */}
                  <div className="mb-4">
                    <label className="w-full py-2.5 px-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 text-[#374151] text-xs font-bold cursor-pointer">
                      <Upload size={14} className="text-[#3B82F6]" />
                      Custom Image Upload
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>

                  {/* System Prompt Specification */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] uppercase tracking-wider font-extrabold text-[#9CA3AF]">
                      AI Prompt Payload
                    </span>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="w-full h-24 p-2 bg-stone-50 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#3B82F6] text-gray-700"
                    />
                  </div>

                  {/* Send request action */}
                  <button
                    onClick={runAnalysisAPI}
                    disabled={imageEndpointLoading}
                    className="w-full mt-4 py-3 bg-[#3B82F6] disabled:bg-gray-100 hover:bg-blue-600 font-bold text-white text-xs rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    <Play size={13} fill="currentColor" />
                    {imageEndpointLoading ? "Executing analysis..." : "Run POST Request"}
                  </button>
                </div>

              </div>

              {/* Right Output logs & specs */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Visualizer and payload block side-by-side */}
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                  <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3 mb-4">
                    <h3 className="font-bold text-[#111827] text-sm">Interactive Sandbox Display</h3>
                    {imageEndpointStatus && (
                      <span
                        className={`px-2.5 py-0.5 rounded font-mono text-xs font-bold ${
                          imageEndpointStatus === 200 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        HTTP {imageEndpointStatus}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Visual target container */}
                    <div className="p-3 bg-[#FAFAFA] border border-gray-200 rounded-xl relative flex flex-col items-center justify-center aspect-square">
                      <span className="absolute top-2 left-2 bg-[#111827] text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                        Payload Img Source
                      </span>
                      {scannedImage ? (
                        <img src={scannedImage} alt="Analysis Source" className="max-h-56 object-contain rounded-lg" />
                      ) : (
                        <div className="text-gray-400 text-xs">No preset or uploaded photo target</div>
                      )}
                    </div>

                    {/* Developer Terminal Response */}
                    <div className="flex flex-col h-full min-h-[295px] bg-stone-900 rounded-xl border border-stone-800 text-white overflow-hidden p-4">
                      <div className="flex justify-between items-center pb-2 border-b border-stone-800 mb-3 shrink-0">
                        <span className="font-mono text-[10px] text-[#9CA3AF] flex items-center gap-1.5">
                          <Terminal size={12} className="text-green-400" />
                          RESPONSE JSON
                        </span>
                        {payloadImageResponse && (
                          <button
                            onClick={() => copyToClipboard(payloadImageResponse, "analysis")}
                            className="text-stone-400 hover:text-white transition"
                          >
                            <Copy size={12} />
                          </button>
                        )}
                      </div>

                      {copiedText === "analysis" && (
                        <div className="text-[10px] text-green-400 bg-stone-800/60 p-1.5 rounded text-center mb-2 animate-bounce">
                          Copied terminal payload!
                        </div>
                      )}

                      <div className="flex-1 font-mono text-xs overflow-y-auto whitespace-pre-wrap text-green-400">
                        {imageEndpointLoading ? (
                          <div className="flex flex-col items-center justify-center py-10 text-stone-400 select-none">
                            <RefreshCw size={18} className="animate-spin text-stone-400 mb-2" />
                            <span>Requesting gemini-3.5-flash...</span>
                          </div>
                        ) : payloadImageResponse ? (
                          payloadImageResponse
                        ) : (
                          <span className="text-stone-500 select-none">Trigger the sandbox request on the left to analyze food proteins...</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Render Visual summary parser if analysis successful */}
                  {payloadImageResponse && !imageEndpointLoading && (
                    <div className="mt-5 pt-4 border-t border-[#F3F4F6] space-y-3">
                      <h4 className="text-xs uppercase font-extrabold text-[#9CA3AF] tracking-wider">
                        Component-Side Parser Simulation
                      </h4>
                      
                      {(() => {
                        try {
                          const parsed = JSON.parse(payloadImageResponse);
                          const isSuccess = parsed.code === 200 && parsed.data;
                          if (!isSuccess) {
                            return (
                              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                                <AlertCircle size={15} />
                                Database / Model Connection Error: {parsed.error || "Malformed API payload"}
                              </div>
                            );
                          }

                          const codes: number[] = parsed.data.allergens || [];
                          if (codes.length === 0) {
                            return (
                              <div className="p-4 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl flex items-start gap-2">
                                <ShieldCheck size={18} className="text-blue-600 mt-0.5" />
                                <div>
                                  <div className="font-bold text-xs">All Clear (식약처 검사인증 완료)</div>
                                  <p className="text-[11px] mt-1 leading-relaxed"> No mandatory allergens identified in match logs.</p>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-2.5">
                              <div className="p-3.5 bg-red-50 text-red-800 border border-red-200 rounded-xl flex items-start gap-2.5">
                                <ShieldAlert size={18} className="text-red-600 mt-0.5" />
                                <div>
                                  <div className="font-bold text-xs">Allergen Warning (감지된 항원성 식별)</div>
                                  <p className="text-[11px] mt-0.5 leading-relaxed">
                                    The active model mapped {codes.length} high-allergy ingredients safely.
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                {codes.map((code) => {
                                  const details = ALLERGENS_MAP[code] || {
                                    nameKr: `알레르기 (Code ${code})`,
                                    nameEn: "Unknown Protein",
                                    emoji: "🧪"
                                  };
                                  return (
                                    <div key={code} className="p-3 border border-gray-200 rounded-xl bg-white flex items-center space-x-2.5 shadow-3xs">
                                      <span className="text-xl bg-stone-50 w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center">{details.emoji}</span>
                                      <div>
                                        <div className="text-xs font-bold text-[#111827]">{details.nameKr}</div>
                                        <div className="text-[10px] text-[#9CA3AF] uppercase font-mono">{details.nameEn}</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        } catch {
                          return null;
                        }
                      })()}
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* VIEW C: COMMUNITY BOARD BULLETIN API PLAYGROUND */}
          {activeTab === "community_api" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: API specifications & creation forms */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Setup API writer section */}
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                  <h3 className="font-bold text-[#111827] text-base mb-1.5 flex items-center gap-1.5">
                    ✍️ API: POST /api/community/write
                  </h3>
                  <p className="text-xs text-[#6B7280] mb-5">
                    Write backplane logs. Push a clean JSON object containing title, description, and hashtags arrays.
                  </p>

                  <form onSubmit={runCreatePostAPI} className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-extrabold text-[#9CA3AF] mb-1">
                        Article Title
                      </label>
                      <input
                        type="text"
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        className="w-full p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#3B82F6]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-extrabold text-[#9CA3AF] mb-1">
                        Content Body
                      </label>
                      <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="w-full h-24 p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#3B82F6]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-extrabold text-[#9CA3AF] mb-1">
                        Comma Separated Hashtags
                      </label>
                      <input
                        type="text"
                        value={newPostHashtags}
                        onChange={(e) => setNewPostHashtags(e.target.value)}
                        className="w-full p-2.5 bg-[#FAFAFA] border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#3B82F6]"
                        placeholder="이유식, 대두, 두부"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={postSubmitting}
                      className="w-full py-2.5 bg-[#111827] hover:bg-stone-800 disabled:bg-gray-100 disabled:text-gray-400 text-white text-xs font-bold rounded-xl transition"
                    >
                      {postSubmitting ? "Submitting payload..." : "Create Post (POST Payload)"}
                    </button>
                  </form>
                </div>

                {/* Database writer config details */}
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                  <h3 className="font-bold text-[#111827] text-sm mb-2.5">Live Mock writer session settings</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">TESTER NICKNAME (user_name)</label>
                      <input
                        type="text"
                        value={sessionUser.name}
                        onChange={(e) => setSessionUser(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-2 bg-[#FAFAFA] border border-gray-100 rounded-lg text-xs text-gray-600 focus:outline-none focus:border-[#3B82F6]"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Dynamic Feed Reader Simulation */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                  
                  {/* Title Bar */}
                  <div className="pb-3 border-b border-[#F3F4F6] flex justify-between items-center mb-5">
                    <h3 className="font-bold text-[#111827] text-base flex items-center gap-1.5">
                      📖 Interactive Data Stream Parser
                    </h3>
                    <button
                      onClick={loadDashboardArticles}
                      className="p-1 px-2.5 border border-gray-200 rounded text-xs hover:bg-gray-50 flex items-center gap-1 transition"
                    >
                      <RefreshCw size={11} /> Refresh Feed
                    </button>
                  </div>

                  {/* Standard feed view vs thread view */}
                  {!activeArticle ? (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-500 italic mb-1">
                        Select a live thread below to view dynamic responses from <code className="bg-[#F3F4F6] px-1 py-0.5 rounded text-xs">/api/community/comment</code>.
                      </p>

                      {articlesLoading && articles.length === 0 ? (
                        <div className="py-20 flex justify-center items-center">
                          <RefreshCw size={24} className="text-[#3B82F6] animate-spin" />
                        </div>
                      ) : articles.length === 0 ? (
                        <div className="py-12 text-center text-xs text-gray-500">
                          Bulletin feed is currently empty. Push a new topic using the endpoint form!
                        </div>
                      ) : (
                        articles.map((art) => (
                          <div
                            key={art.id}
                            onClick={() => handleSelectArticleDetail(art)}
                            className="p-4 border border-gray-200 rounded-xl hover:border-[#3B82F6] bg-white transition cursor-pointer flex justify-between items-start"
                          >
                            <div className="space-y-1 overflow-hidden pr-3">
                              <h4 className="text-sm font-bold text-[#111827] truncate hover:text-[#1D4ED8]">
                                {art.article_title}
                              </h4>
                              <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed">
                                {art.article_content}
                              </p>
                              <div className="flex flex-wrap gap-1 pt-1.5">
                                {art.article_hash_tag.map((tag, i) => (
                                  <span key={i} className="text-[9px] bg-[#EFF6FF] text-[#1D4ED8] px-2 py-0.5 rounded font-bold">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <ChevronRight size={14} className="text-[#9CA3AF] shrink-0 mt-1" />
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    /* Thread view */
                    <div className="space-y-5">
                      
                      {/* Back button */}
                      <button
                        onClick={() => setActiveArticle(null)}
                        className="py-1 px-2 text-[#3B82F6] hover:bg-blue-50 hover:text-[#1D4ED8] rounded-md text-xs font-bold flex items-center gap-1 transition"
                      >
                        <ChevronLeft size={14} /> Back to API Registry Feed
                      </button>

                      {/* Header details */}
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <span className="text-[10px] uppercase font-extrabold text-[#9CA3AF] tracking-wider mb-1 block">Topic Profile</span>
                        <h4 className="text-base font-bold text-[#111827]">{activeArticle.article_title}</h4>
                        <p className="text-xs text-gray-700 leading-relaxed mt-2 whitespace-pre-wrap">{activeArticle.article_content}</p>
                        
                        <div className="flex items-center justify-between text-[10px] text-[#9CA3AF] mt-4 pt-3 border-t border-gray-200">
                          <span className="font-mono">ARTICLE ID: {activeArticle.id}</span>
                          <span className="font-bold">{new Date(activeArticle.created_at).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Comments feed integration */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-bold text-[#111827] text-xs uppercase tracking-wider text-gray-500">
                            Comments Dynamic Payload (/api/community/comment)
                          </h5>
                          {commentsLoading && <RefreshCw size={12} className="animate-spin text-gray-400" />}
                        </div>

                        {comments.length === 0 ? (
                          <div className="p-4 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400 italic">
                            No comments attached to this article ID yet. Publish the initial payload below!
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {comments.map((c) => (
                              <div key={c.id} className="p-3 bg-white border border-gray-200 rounded-xl flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-gray-800">{c.user_name}</span>
                                    <span className="text-[9px] font-mono text-gray-400">({c.user_id})</span>
                                  </div>
                                  <p className="text-xs text-gray-600 leading-relaxed">{c.content}</p>
                                  <span className="block text-[9px] text-[#9CA3AF]">{new Date(c.created_at).toLocaleString()}</span>
                                </div>

                                <button
                                  onClick={() => runLikeCommentAPI(c.id)}
                                  className="py-1 px-2.5 border border-gray-100 hover:border-blue-100 bg-gray-50/50 hover:bg-blue-50 text-gray-500 hover:text-[#1D4ED8] rounded-md text-[10px] font-bold flex items-center gap-1 transition"
                                >
                                  <ThumbsUp size={11} />
                                  <span>{c.likes}</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Interactive comment form submission */}
                        <form onSubmit={runCreateCommentAPI} className="border-t border-gray-150 pt-4 space-y-3">
                          <div>
                            <label className="block text-[9px] uppercase font-extrabold text-[#9CA3AF] mb-1">
                              Publish comment via POST Payload
                            </label>
                            <input
                              type="text"
                              value={newCommentText}
                              onChange={(e) => setNewCommentText(e.target.value)}
                              className="w-full p-2.5 bg-[#FAFAFA] border border-gray-250 rounded-lg text-xs text-gray-700 focus:outline-none focus:border-[#3B82F6]"
                              required
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={commentSubmitting}
                            className="py-2 px-4 bg-[#3B82F6] hover:bg-blue-600 font-bold text-white text-xs rounded-lg transition"
                          >
                            {commentSubmitting ? "Posting..." : "POST Comment"}
                          </button>
                        </form>

                      </div>

                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* VIEW E: INTERACTIVE API DOCUMENTS PANEL */}
          {activeTab === "api_docs" && (
            <div className="space-y-6">
              
              {/* Filter Row and search input */}
              <div className="bg-white border border-[#E5E7EB] p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search field */}
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                    <Terminal size={15} />
                  </div>
                  <input
                    type="text"
                    placeholder="엔드포인트 경로 혹은 기능 키워드 실시간 필터링..."
                    value={docSearchQuery}
                    onChange={(e) => setDocSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#F9FAFB] border border-gray-200 rounded-lg text-xs placeholder-gray-400 focus:outline-none focus:border-[#3B82F6] text-gray-800 transition"
                  />
                  {docSearchQuery && (
                    <button
                      onClick={() => setDocSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-semibold"
                    >
                      CLEAR
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setDocActiveCategory("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      docActiveCategory === "all"
                        ? "bg-[#111827] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    전체보기
                  </button>
                  <button
                    onClick={() => setDocActiveCategory("allergens")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      docActiveCategory === "allergens"
                        ? "bg-[#10B981] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    알레르기 AI
                  </button>
                  <button
                    onClick={() => setDocActiveCategory("community")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      docActiveCategory === "community"
                        ? "bg-[#3B82F6] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    커뮤니티 토론
                  </button>
                  <button
                    onClick={() => setDocActiveCategory("diagnostics")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      docActiveCategory === "diagnostics"
                        ? "bg-[#8B5CF6] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                    헬스체크
                  </button>
                </div>
              </div>

              {/* Endpoints List container */}
              <div className="space-y-6">
                {filteredEndpoints.map((ep) => (
                    <div
                      key={ep.id}
                      className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-all grid grid-cols-1 lg:grid-cols-12"
                    >
                      {/* Left: Metadata specifications */}
                      <div className="lg:col-span-7 p-6 border-r border-[#F3F4F6] space-y-4">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-extrabold border uppercase ${
                              ep.method === "POST"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {ep.method}
                          </span>
                          <span className="font-mono text-sm font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                            {ep.path}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md uppercase">
                            {ep.category}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-[#111827]">{ep.summary}</h4>
                          <p className="text-xs text-[#6B7280] leading-relaxed mt-1.5">{ep.description}</p>
                        </div>

                        {/* Request Headers parameters */}
                        <div className="space-y-2">
                          <span className="block text-[10px] uppercase font-extrabold text-[#9CA3AF] tracking-wider">
                            HTTP Request Headers
                          </span>
                          <div className="p-3 bg-[#FAFAFA] rounded-xl border border-[#F3F4F6] text-xs space-y-1.5">
                            {ep.headers.map((h, i) => (
                              <div key={i} className="flex items-center justify-between font-mono">
                                <span className="text-gray-600">{h.name}:</span>
                                <span className="font-semibold text-gray-800">{h.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Request parameters detail */}
                        <div className="space-y-2.5">
                          <span className="block text-[10px] uppercase font-extrabold text-[#9CA3AF] tracking-wider">
                            Request Body Parameters
                          </span>
                          {ep.parameters.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No request body parameters required.</p>
                          ) : (
                            <div className="border border-gray-150 rounded-xl overflow-hidden divide-y divide-gray-100">
                              {ep.parameters.map((p, i) => (
                                <div key={i} className="p-3.5 bg-white text-xs flex flex-col md:flex-row md:items-start justify-between gap-2 hover:bg-[#FAFAFA]">
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono font-bold text-gray-800">{p.name}</span>
                                      <span className="font-mono text-[10px] text-gray-400">({p.type})</span>
                                      {p.required ? (
                                        <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1 py-0.2 rounded">Required</span>
                                      ) : (
                                        <span className="text-[9px] text-gray-400 bg-gray-50 px-1 py-0.2 rounded">Optional</span>
                                      )}
                                    </div>
                                    <p className="text-[#6B7280] leading-relaxed mt-0.5">{p.desc}</p>
                                  </div>
                                  {p.default && (
                                    <span className="text-[10px] font-mono text-gray-500 bg-gray-100 rounded px-1.5 py-0.5 shrink-0">
                                      Default: {p.default}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Code Console Visualizers */}
                      <div className="lg:col-span-5 bg-slate-900 p-6 flex flex-col justify-between text-white border-l border-slate-800 flex-1">
                        {/* Interactive Curl container */}
                        <div className="space-y-3 flex-1 pb-4">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                            <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest font-extrabold flex items-center gap-1">
                              <Terminal size={11} className="text-sky-400" /> Live CURL CLI COMMAND
                            </span>
                            <button
                              onClick={() => copyToClipboard(ep.curlExample, ep.id + "_curl")}
                              className="text-stone-400 hover:text-white text-xs flex items-center gap-1 transition"
                            >
                              {copiedText === ep.id + "_curl" ? "Copied!" : "Copy command"}
                              <Copy size={11} />
                            </button>
                          </div>
                          <pre className="font-mono text-[11px] text-zinc-300 p-3 bg-slate-950 rounded-xl overflow-x-auto border border-slate-850/60 leading-relaxed whitespace-pre-wrap">
                            {ep.curlExample}
                          </pre>
                        </div>

                        {/* Interactive Output Response JSON container */}
                        <div className="space-y-3 pt-4 border-t border-slate-800/80">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                            <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest font-extrabold flex items-center gap-1">
                              <CheckCircle size={11} /> MOCK RESPONSE HTTP 200
                            </span>
                            <button
                              onClick={() => copyToClipboard(ep.responseExample, ep.id + "_res")}
                              className="text-stone-400 hover:text-white text-xs flex items-center gap-1 transition"
                            >
                              {copiedText === ep.id + "_res" ? "Copied!" : "Copy JSON"}
                              <Copy size={11} />
                            </button>
                          </div>
                          <pre className="font-mono text-[11px] text-emerald-400/95 p-3 bg-slate-950 rounded-xl overflow-x-auto border border-slate-850/60 leading-relaxed whitespace-pre font-medium">
                            {ep.responseExample}
                          </pre>
                          <div className="p-3 bg-zinc-950/60 rounded-lg text-[10.5px] text-zinc-400 leading-normal border border-zinc-900 font-sans">
                            <strong className="text-zinc-200">데이터 규격:</strong> {ep.responseDesc}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                {filteredEndpoints.length === 0 && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center text-gray-400 text-xs shadow-3xs">
                    인증검지 및 키워드와 매치되는 등록된 API 엔드포인트 사양이 없습니다.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* VIEW D: DATABASE SCHEMAS & CURL DOCS */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                <h3 className="font-bold text-[#111827] text-base mb-2">Relational Table Specifications (Supabase DDL)</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
                  Run the following PostgreSQL commands in your Supabase SQL Editor workspace to instantiate secure schemas for caching and post records.
                </p>

                <div className="relative bg-stone-900 border border-stone-850 rounded-xl overflow-hidden p-4">
                  <div className="flex justify-between items-center pb-2 border-b border-stone-800 mb-3 text-white">
                    <span className="font-mono text-xs text-green-400">schema-blueprints.sql</span>
                    <button
                      onClick={() => copyToClipboard(sqlSchemaText, "sql")}
                      className="text-stone-400 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
                    >
                      {copiedText === "sql" ? "copied!" : "Copy SQL Code"}
                      <Copy size={12} />
                    </button>
                  </div>
                  <pre className="font-mono text-xs text-gray-100 overflow-x-auto whitespace-pre leading-relaxed">
                    {sqlSchemaText}
                  </pre>
                </div>
              </div>

              {/* Developer guide summary integration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                  <h4 className="font-bold text-[#111827] text-sm mb-2.5">API Integration Specs</h4>
                  <ul className="text-xs text-gray-600 gap-2 flex flex-col list-disc pl-4 leading-relaxed">
                    <li>
                      <strong>Automatic Base64 payload detection:</strong> Base64 images are sent directly to the client endpoint as inline string literals structure.
                    </li>
                    <li>
                      <strong>Performance Caching:</strong> Image hashes prevent duplicate execution charges on Gemini 1.5 Pro to conserve credits dynamically within your active deployment plan.
                    </li>
                    <li>
                      <strong>JSON Safe Formatting:</strong> Built-in server modules safely parse code ticks and output standard serialization outputs dynamically.
                    </li>
                  </ul>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                  <h4 className="font-bold text-[#111827] text-sm mb-2.5">Endpoint Health Checklist</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      <span className="text-xs font-mono font-semibold">GET /api/db-status</span>
                      <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded border border-green-200">200 OK</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      <span className="text-xs font-mono font-semibold">POST /api/gemini-api</span>
                      <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded border border-green-200">200 OK</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
