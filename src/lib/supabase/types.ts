// src/lib/supabase/types.ts
// LifeBloom Hub — TypeScript Type Declarations for Supabase PostgreSQL (2026)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          subscription_tier: 'free' | 'premium'
          default_locale: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          subscription_tier?: 'free' | 'premium'
          default_locale?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          subscription_tier?: 'free' | 'premium'
          default_locale?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          user_id: string
          bloom_points: number
          current_streak: number
          longest_streak: number
          last_login_date: string
          updated_at: string
        }
        Insert: {
          user_id: string
          bloom_points?: number
          current_streak?: number
          longest_streak?: number
          last_login_date?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          bloom_points?: number
          current_streak?: number
          longest_streak?: number
          last_login_date?: string
          updated_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          user_id: string
          badge_key: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_key: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_key?: string
          unlocked_at?: string
        }
      }
      products: {
        Row: {
          id: string
          slug: string
          pillar: 'home' | 'money' | 'pet' | 'senior' | 'travel'
          name: string
          description: string | null
          price: number
          original_price: number | null
          currency: string
          image_url: string | null
          affiliate_url: string
          vendor: string
          rating: number | null
          reviews_count: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          pillar: 'home' | 'money' | 'pet' | 'senior' | 'travel'
          name: string
          description?: string | null
          price: number
          original_price?: number | null
          currency?: string
          image_url?: string | null
          affiliate_url: string
          vendor: string
          rating?: number | null
          reviews_count?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          pillar?: 'home' | 'money' | 'pet' | 'senior' | 'travel'
          name?: string
          description?: string | null
          price?: number
          original_price?: number | null
          currency?: string
          image_url?: string | null
          affiliate_url?: string
          vendor?: string
          rating?: number | null
          reviews_count?: number
          is_active?: boolean
          created_at?: string
        }
      }
      articles: {
        Row: {
          id: string
          slug: string
          pillar: 'home' | 'money' | 'pet' | 'senior' | 'travel'
          title: string
          description: string | null
          content: string
          image_url: string | null
          source_url: string | null
          author: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          pillar: 'home' | 'money' | 'pet' | 'senior' | 'travel'
          title: string
          description?: string | null
          content: string
          image_url?: string | null
          source_url?: string | null
          author?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          pillar?: 'home' | 'money' | 'pet' | 'senior' | 'travel'
          title?: string
          description?: string | null
          content?: string
          image_url?: string | null
          source_url?: string | null
          author?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          slug: string
          pillar: 'home' | 'money' | 'pet' | 'senior' | 'travel'
          title: string
          description: string | null
          platform: 'youtube' | 'vimeo' | 'custom'
          video_id: string
          duration: number | null
          thumbnail_url: string | null
          transcript: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          pillar: 'home' | 'money' | 'pet' | 'senior' | 'travel'
          title: string
          description?: string | null
          platform?: 'youtube' | 'vimeo' | 'custom'
          video_id: string
          duration?: number | null
          thumbnail_url?: string | null
          transcript?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          pillar?: 'home' | 'money' | 'pet' | 'senior' | 'travel'
          title?: string
          description?: string | null
          platform?: 'youtube' | 'vimeo' | 'custom'
          video_id?: string
          duration?: number | null
          thumbnail_url?: string | null
          transcript?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      saved_items: {
        Row: {
          id: string
          user_id: string
          item_type: 'product' | 'article' | 'video' | 'calculation'
          referenced_id: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_type: 'product' | 'article' | 'video' | 'calculation'
          referenced_id: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_type?: 'product' | 'article' | 'video' | 'calculation'
          referenced_id?: string
          metadata?: Json | null
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          action_type: string
          points_awarded: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action_type: string
          points_awarded?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action_type?: string
          points_awarded?: number
          created_at?: string
        }
      }
      automated_internal_links: {
        Row: {
          id: string
          source_slug: string
          target_slug: string
          anchor_text: string
          created_at: string
        }
        Insert: {
          id?: string
          source_slug: string
          target_slug: string
          anchor_text: string
          created_at?: string
        }
        Update: {
          id?: string
          source_slug?: string
          target_slug?: string
          anchor_text?: string
          created_at?: string
        }
      }
      calculations_history: {
        Row: {
          id: string
          user_id: string
          calculator_slug: string
          input_params: Json
          output_results: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          calculator_slug: string
          input_params: Json
          output_results: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          calculator_slug?: string
          input_params?: Json
          output_results?: Json
          created_at?: string
        }
      }
    }
  }
}
