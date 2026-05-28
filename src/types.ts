export interface AllergenInfo {
  code: number;
  nameKr: string;
  nameEn: string;
  emoji: string;
  description: string;
}

export const ALLERGENS_MAP: Record<number, AllergenInfo> = {
  1: { code: 1, nameKr: "난류 (가금류)", nameEn: "Egg", emoji: "🥚", description: "달걀, 메추리알 등 가금류의 알" },
  2: { code: 2, nameKr: "우유", nameEn: "Milk", emoji: "🥛", description: "우유, 치즈, 버터 및 유제품" },
  3: { code: 3, nameKr: "메밀", nameEn: "Buckwheat", emoji: "🌾", description: "메밀 국수, 메밀묵, 메밀가루 가공품" },
  4: { code: 4, nameKr: "땅콩", nameEn: "Peanut", emoji: "🥜", description: "땅콩 및 땅콩 가공 유제품, 소스" },
  5: { code: 5, nameKr: "대두", nameEn: "Soybean", emoji: "🫘", description: "콩, 두부, 간장, 된장, 대두유" },
  6: { code: 6, nameKr: "밀", nameEn: "Wheat", emoji: "🌾", description: "밀가루, 빵, 면류, 과자 및 전분류" },
  7: { code: 7, nameKr: "고등어", nameEn: "Mackerel", emoji: "🐟", description: "고등어 및 생선 단백질 제품" },
  8: { code: 8, nameKr: "게", nameEn: "Crab", emoji: "🦀", description: "게, 게살, 게 가공 조미료" },
  9: { code: 9, nameKr: "새우", nameEn: "Shrimp", emoji: "🦐", description: "새우, 건새우, 새우젓 및 육수" },
  10: { code: 10, nameKr: "돼지고기", nameEn: "Pork", emoji: "🐷", description: "돼지고기, 햄, 소시지, 라드유" },
  11: { code: 11, nameKr: "복숭아", nameEn: "Peach", emoji: "🍑", description: "복숭아, 주스, 복숭아 추출 잼류" },
  12: { code: 12, nameKr: "토마토", nameEn: "Tomato", emoji: "🍅", description: "토마토, 케첩, 소스, 스파게티 베이스" },
  13: { code: 13, nameKr: "아황산류", nameEn: "Sulfites", emoji: "🧪", description: "이산화황(SO2) 10mg/kg 이상 함유 가공품, 와인, 건조과일" },
  14: { code: 14, nameKr: "호두", nameEn: "Walnut", emoji: "🫘", description: "호두, 견과류 믹스, 호두 오일" },
  15: { code: 15, nameKr: "닭고기", nameEn: "Chicken", emoji: "🐔", description: "닭고기, 닭육수, 치킨 파우더" },
  16: { code: 16, nameKr: "쇠고기", nameEn: "Beef", emoji: "🥩", description: "소고기, 육수, 다시다 국물 베이스" },
  17: { code: 17, nameKr: "오징어", nameEn: "Squid", emoji: "🦑", description: "오징어, 오징어 조미 가공품" },
  18: { code: 18, nameKr: "조개류", nameEn: "Shellfish", emoji: "🦪", description: "굴, 전복, 홍합, 바지락 등 패류" },
  19: { code: 19, nameKr: "잣", nameEn: "Pine Nut", emoji: "🌲", description: "잣, 한과, 견과 고명" },
  20: { code: 20, nameKr: "알레르기 유래 추출물", nameEn: "Allergen Derivative", emoji: "🧬", description: "위 1~19번 성분에서 파생된 추출물 및 성분 공정 물질" },
};

export interface Article {
  id: number;
  article_title: string;
  article_content: string;
  article_hash_tag: string[]; // JSON array
  created_at: string;
}

export interface Comment {
  id: number;
  article_id: number;
  user_name: string;
  user_id: string;
  content: string;
  likes: number;
  created_at: string;
}

export interface DatabaseStatus {
  mode: "supabase" | "sandbox";
  connected: boolean;
  message?: string;
}
