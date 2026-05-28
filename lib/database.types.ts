export interface Database {
  public: {
    Tables: {
      articles: {
        Row: {
          id: number;
          article_title: string;
          article_content: string;
          article_hash_tag: string[];
          created_at: string;
        };

        Insert: {
          id?: never;
          article_title: string;
          article_content: string;
          article_hash_tag?: string[];
          created_at?: string;
        };

        Update: {
          id?: never;
          article_title?: string;
          article_content?: string;
          article_hash_tag?: string[];
          created_at?: string;
        };
      };

      comments: {
        Row: {
          id: number;
          article_id: number;
          user_name: string;
          user_id: string;
          content: string;
          likes: number;
          created_at: string;
        };

        Insert: {
          id?: never;
          article_id: number;
          user_name: string;
          user_id: string;
          content: string;
          likes?: number;
          created_at?: string;
        };

        Update: {
          id?: never;
          article_id?: number;
          user_name?: string;
          user_id?: string;
          content?: string;
          likes?: number;
          created_at?: string;
        };
      };

      gemini_cache: {
        Row: {
          id: number;
          image_hash: string;
          result: {
            allergens: number[];
          };
          created_at: string;
        };

        Insert: {
          id?: never;
          image_hash: string;
          result: {
            allergens: number[];
          };
          created_at?: string;
        };

        Update: {
          id?: never;
          image_hash?: string;
          result?: {
            allergens: number[];
          };
          created_at?: string;
        };
      };
    };

    Views: Record<string, never>;

    Functions: Record<string, never>;

    Enums: Record<string, never>;

    CompositeTypes: Record<string, never>;
  };
}
