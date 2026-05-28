export interface FoodPreset {
  id: string;
  name: string;
  description: string;
  allergens: number[];
  bgColor: string;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

export const FOOD_PRESETS: FoodPreset[] = [
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

export const getEndpointsData = (origin: string) => [
  {
    id: "db_status",
    method: "GET",
    path: "/api/db-status",
    category: "diagnostics" as const,
    summary: "시스템 진단 및 DB 연동 점검",
    description: "인스턴스 구동 초기화 및 환경설정 연동 여부를 취합하는 엔드포인트입니다. Supabase 및 Gemini 인공지능 모듈이 활성화되어 정상적인 질의를 수락할 수 있는 상태인지 검증합니다.",
    headers: [
      { name: "Accept", value: "application/json", required: true }
    ],
    parameters: [],
    curlExample: `curl -X GET "${origin}/api/db-status" \\\n  -H "Accept: application/json"`,
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
    category: "allergens" as const,
    summary: "음식 사진 인공지능 알레르기 분석 원본",
    description: "이미지 원본 Base64 바이너리를 인공지능 모델에 전달해 알레르기 수치를 안전하게 도출합니다. 동일 이미지 해시에 대해서 데이터베이스 캐싱 계층이 자동 동작하여 AI 할당량 낭비를 최적화합니다.",
    headers: [
      { name: "Content-Type", value: "application/json", required: true }
    ],
    parameters: [
      { name: "img", type: "string", required: true, desc: "분석 대상 음식 접시 사진의 Base64 인코딩 스트링 (디렉토리 및 data: 형식 수락)" },
      { name: "prompt", type: "string", required: false, default: "ALLERGENS_MAP 식별 요청", desc: "검출 프로세스를 정의할 AI 가이드라인 지시문" }
    ],
    curlExample: `curl -X POST "${origin}/api/gemini-api" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "img": "data:image/png;base64,iVBORw...",\n    "prompt": "Return ONLY valid JSON allergens list."\n  }'`,
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
    category: "community" as const,
    summary: "커뮤니티 토론 게시물 리스트",
    description: "데이터베이스 통합 Bulletin Board 보드의 스레드 리스트들을 페이지 규격 지표에 따라서 안전하게 호출합니다. (POST 요청 역시 동일한 구조로 중복 수락됩니다.)",
    headers: [
      { name: "Accept", value: "application/json", required: true }
    ],
    parameters: [
      { name: "page", type: "integer", required: false, default: "1", desc: "조회할 페이징 넘버 번호" }
    ],
    curlExample: `curl -X GET "${origin}/api/community?page=1" \\\n  -H "Accept: application/json"`,
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
    category: "community" as const,
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
    curlExample: `curl -X POST "${origin}/api/community/write" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "article_title": "대두 단백질 대체품 질문",\n    "article_content": "콩 알레르기가 심한 영아용 산양유 섭취 가이드를 여쭙니다.",\n    "article_hash_tag": ["대두", "영아", "산양유"]\n  }'`,
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
    category: "community" as const,
    summary: "게시글 타겟 실시간 댓글 로드",
    description: "특정 타겟 게시글 외래키 식별 정보를 기준으로 작성 수렴된 서브 댓글 피드를 로딩합니다.",
    headers: [
      { name: "Accept", value: "application/json", required: true }
    ],
    parameters: [
      { name: "article_id", type: "integer", required: true, desc: "타겟 매칭 부모 게시글 고유 ID 코드" }
    ],
    curlExample: `curl -X GET "${origin}/api/community/comment?article_id=21" \\\n  -H "Accept: application/json"`,
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
    category: "community" as const,
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
    curlExample: `curl -X POST "${origin}/api/community/comment/write" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "user_name": "HomeBaker",\n    "user_id": "dev_3c92",\n    "content": "차전자피 가루가 글루텐 끈기를 상당 부분 살려줍니다.",\n    "article_id": 21\n  }'`,
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
    category: "community" as const,
    summary: "댓글 유용성 추천 (좋아요 가산)",
    description: "솔루션이 유용할 때 카운트 수치를 올려 동기 부여 평가 점수에 직접 가산합니다.",
    headers: [
      { name: "Content-Type", value: "application/json", required: true }
    ],
    parameters: [
      { name: "comment_id", type: "integer", required: true, desc: "가중치 추천을 적용하여 갱신할 대상 코멘트 고유식별 값" }
    ],
    curlExample: `curl -X POST "${origin}/api/community/comment/like" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "comment_id": 115\n  }'`,
    responseExample: JSON.stringify({
      success: true
    }, null, 2),
    responseDesc: "success: 트랜잭션 수치 갱신 성공 여부."
  }
];
