export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      articles: {
        Row: {
          id: number;
          article_title: string;
          article_content: string;
          article_hash_tag: Json;
          created_at: string;
        };

        Insert: {
          article_title: string;
          article_content: string;
          article_hash_tag?: Json;
        };

        Update: {
          article_title?: string;
          article_content?: string;
          article_hash_tag?: Json;
        };

        Relationships: [];
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
          article_id: number;
          user_name: string;
          user_id: string;
          content: string;
          likes?: number;
        };

        Update: {
          article_id?: number;
          user_name?: string;
          user_id?: string;
          content?: string;
          likes?: number;
        };

        Relationships: [];
      };

      gemini_cache: {
        Row: {
          id: number;
          image_hash: string;
          result: Json;
          created_at: string;
        };

        Insert: {
          image_hash: string;
          result: Json;
        };

        Update: {
          image_hash?: string;
          result?: Json;
        };

        Relationships: [];
      };
    };

    Views: {};

    Functions: {};

    Enums: {};

    CompositeTypes: {};
  };
}
