export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action_type: string
          created_at: string
          id: string
          points_awarded: number
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          points_awarded?: number
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          points_awarded?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_clicks: {
        Row: {
          created_at: string | null
          id: string
          link_type: string
          pillar: string
          referenced_id: string
          target_url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          link_type: string
          pillar: string
          referenced_id: string
          target_url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          link_type?: string
          pillar?: string
          referenced_id?: string
          target_url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      aggregated_content: {
        Row: {
          content_hash: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_approved: boolean | null
          is_blacklisted: boolean
          metadata: Json | null
          original_url: string | null
          pillar: string
          published_at: string
          source_name: string
          source_type: string
          summary_de: string | null
          summary_en: string | null
          summary_es: string | null
          summary_fr: string | null
          summary_id: string | null
          title_de: string | null
          title_en: string | null
          title_es: string | null
          title_fr: string | null
          title_id: string | null
        }
        Insert: {
          content_hash?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_approved?: boolean | null
          is_blacklisted?: boolean
          metadata?: Json | null
          original_url?: string | null
          pillar: string
          published_at: string
          source_name: string
          source_type: string
          summary_de?: string | null
          summary_en?: string | null
          summary_es?: string | null
          summary_fr?: string | null
          summary_id?: string | null
          title_de?: string | null
          title_en?: string | null
          title_es?: string | null
          title_fr?: string | null
          title_id?: string | null
        }
        Update: {
          content_hash?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_approved?: boolean | null
          is_blacklisted?: boolean
          metadata?: Json | null
          original_url?: string | null
          pillar?: string
          published_at?: string
          source_name?: string
          source_type?: string
          summary_de?: string | null
          summary_en?: string | null
          summary_es?: string | null
          summary_fr?: string | null
          summary_id?: string | null
          title_de?: string | null
          title_en?: string | null
          title_es?: string | null
          title_fr?: string | null
          title_id?: string | null
        }
        Relationships: []
      }
      api_health_logs: {
        Row: {
          api_name: string
          created_at: string | null
          error_payload: string | null
          id: string
          latency_ms: number
          status_code: number
        }
        Insert: {
          api_name: string
          created_at?: string | null
          error_payload?: string | null
          id?: string
          latency_ms: number
          status_code: number
        }
        Update: {
          api_name?: string
          created_at?: string | null
          error_payload?: string | null
          id?: string
          latency_ms?: number
          status_code?: number
        }
        Relationships: []
      }
      articles: {
        Row: {
          author: string | null
          author_id: string | null
          author_type: Database["public"]["Enums"]["author_category"] | null
          content: string
          created_at: string
          description: string | null
          hash_id: string | null
          id: string
          image_url: string | null
          is_active: boolean
          link: string | null
          pillar: string
          pub_date: string | null
          reviewer_notes: string | null
          slug: string
          source_url: string | null
          sponsor_id: string | null
          status:
            | Database["public"]["Enums"]["article_publishing_status"]
            | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author?: string | null
          author_id?: string | null
          author_type?: Database["public"]["Enums"]["author_category"] | null
          content: string
          created_at?: string
          description?: string | null
          hash_id?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link?: string | null
          pillar: string
          pub_date?: string | null
          reviewer_notes?: string | null
          slug: string
          source_url?: string | null
          sponsor_id?: string | null
          status?:
            | Database["public"]["Enums"]["article_publishing_status"]
            | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author?: string | null
          author_id?: string | null
          author_type?: Database["public"]["Enums"]["author_category"] | null
          content?: string
          created_at?: string
          description?: string | null
          hash_id?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link?: string | null
          pillar?: string
          pub_date?: string | null
          reviewer_notes?: string | null
          slug?: string
          source_url?: string | null
          sponsor_id?: string | null
          status?:
            | Database["public"]["Enums"]["article_publishing_status"]
            | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "expert_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      automated_internal_links: {
        Row: {
          anchor_text: string
          created_at: string
          id: string
          source_slug: string
          target_slug: string
        }
        Insert: {
          anchor_text: string
          created_at?: string
          id?: string
          source_slug: string
          target_slug: string
        }
        Update: {
          anchor_text?: string
          created_at?: string
          id?: string
          source_slug?: string
          target_slug?: string
        }
        Relationships: []
      }
      b2b_placements: {
        Row: {
          contract_end: string
          contract_start: string
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string
          partner_name: string
          pinned_calculator: string | null
          pinned_row_position: number | null
          target_url: string
          updated_at: string | null
        }
        Insert: {
          contract_end: string
          contract_start: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url: string
          partner_name: string
          pinned_calculator?: string | null
          pinned_row_position?: number | null
          target_url: string
          updated_at?: string | null
        }
        Update: {
          contract_end?: string
          contract_start?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string
          partner_name?: string
          pinned_calculator?: string | null
          pinned_row_position?: number | null
          target_url?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          badge_key: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          badge_key: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          badge_key?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_ingestion_logs: {
        Row: {
          bot_name: string
          created_at: string | null
          id: string
          slug: string
          user_agent: string
        }
        Insert: {
          bot_name: string
          created_at?: string | null
          id?: string
          slug: string
          user_agent: string
        }
        Update: {
          bot_name?: string
          created_at?: string | null
          id?: string
          slug?: string
          user_agent?: string
        }
        Relationships: []
      }
      calculations_history: {
        Row: {
          calculator_slug: string
          created_at: string
          id: string
          input_params: Json
          output_results: Json
          user_id: string
        }
        Insert: {
          calculator_slug: string
          created_at?: string
          id?: string
          input_params: Json
          output_results: Json
          user_id: string
        }
        Update: {
          calculator_slug?: string
          created_at?: string
          id?: string
          input_params?: Json
          output_results?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calculations_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      canonical_articles: {
        Row: {
          content_html: string
          id: string
          image_url: string | null
          ingested_at: string
          pillar: string | null
          published_at: string | null
          slug: string
          source_hash: string
          source_url: string | null
          title: string
        }
        Insert: {
          content_html: string
          id?: string
          image_url?: string | null
          ingested_at?: string
          pillar?: string | null
          published_at?: string | null
          slug: string
          source_hash: string
          source_url?: string | null
          title: string
        }
        Update: {
          content_html?: string
          id?: string
          image_url?: string | null
          ingested_at?: string
          pillar?: string | null
          published_at?: string | null
          slug?: string
          source_hash?: string
          source_url?: string | null
          title?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          article_id: string | null
          author_email: string | null
          author_name: string
          content: string
          created_at: string
          id: string
          is_approved: boolean | null
          parent_id: string | null
          user_id: string | null
        }
        Insert: {
          article_id?: string | null
          author_email?: string | null
          author_name: string
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          parent_id?: string | null
          user_id?: string | null
        }
        Update: {
          article_id?: string | null
          author_email?: string | null
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          parent_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          category: string
          company_name: string | null
          created_at: string
          email: string
          id: string
          is_reviewed: boolean | null
          message: string
          name: string
        }
        Insert: {
          category: string
          company_name?: string | null
          created_at?: string
          email: string
          id?: string
          is_reviewed?: boolean | null
          message: string
          name: string
        }
        Update: {
          category?: string
          company_name?: string | null
          created_at?: string
          email?: string
          id?: string
          is_reviewed?: boolean | null
          message?: string
          name?: string
        }
        Relationships: []
      }
      content_metrics: {
        Row: {
          category: string | null
          content_type: string
          created_at: string | null
          id: string
          last_updated: string | null
          slug: string
          title: string
          total_views: number | null
          trending_score: number | null
        }
        Insert: {
          category?: string | null
          content_type: string
          created_at?: string | null
          id?: string
          last_updated?: string | null
          slug: string
          title: string
          total_views?: number | null
          trending_score?: number | null
        }
        Update: {
          category?: string | null
          content_type?: string
          created_at?: string | null
          id?: string
          last_updated?: string | null
          slug?: string
          title?: string
          total_views?: number | null
          trending_score?: number | null
        }
        Relationships: []
      }
      expert_profiles: {
        Row: {
          bio: string | null
          citation_count: number | null
          created_at: string | null
          display_name: string
          entity_type: Database["public"]["Enums"]["profile_entity_type"] | null
          google_scholar_url: string | null
          h_index: number | null
          id: string
          last_verified_at: string | null
          logo_url: string | null
          orcid_id: string | null
          pillar_specialty: string | null
          status: Database["public"]["Enums"]["profile_status"] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          website_url: string | null
          wikidata_id: string | null
        }
        Insert: {
          bio?: string | null
          citation_count?: number | null
          created_at?: string | null
          display_name: string
          entity_type?:
            | Database["public"]["Enums"]["profile_entity_type"]
            | null
          google_scholar_url?: string | null
          h_index?: number | null
          id?: string
          last_verified_at?: string | null
          logo_url?: string | null
          orcid_id?: string | null
          pillar_specialty?: string | null
          status?: Database["public"]["Enums"]["profile_status"] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
          wikidata_id?: string | null
        }
        Update: {
          bio?: string | null
          citation_count?: number | null
          created_at?: string | null
          display_name?: string
          entity_type?:
            | Database["public"]["Enums"]["profile_entity_type"]
            | null
          google_scholar_url?: string | null
          h_index?: number | null
          id?: string
          last_verified_at?: string | null
          logo_url?: string | null
          orcid_id?: string | null
          pillar_specialty?: string | null
          status?: Database["public"]["Enums"]["profile_status"] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
          wikidata_id?: string | null
        }
        Relationships: []
      }
      guestbook: {
        Row: {
          author_name: string
          content: string
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guestbook_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          id: string
          slug: string
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          id?: string
          slug?: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_views_slug_fkey"
            columns: ["slug"]
            isOneToOne: false
            referencedRelation: "content_metrics"
            referencedColumns: ["slug"]
          },
        ]
      }
      products: {
        Row: {
          affiliate_url: string
          created_at: string
          currency: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          locale: string | null
          name: string
          original_price: number | null
          pillar: string
          price: number
          price_current: number | null
          price_original: number | null
          rating: number | null
          reviews_count: number
          slug: string
          specs: Json | null
          vendor: string
        }
        Insert: {
          affiliate_url: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          locale?: string | null
          name: string
          original_price?: number | null
          pillar: string
          price: number
          price_current?: number | null
          price_original?: number | null
          rating?: number | null
          reviews_count?: number
          slug: string
          specs?: Json | null
          vendor: string
        }
        Update: {
          affiliate_url?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          locale?: string | null
          name?: string
          original_price?: number | null
          pillar?: string
          price?: number
          price_current?: number | null
          price_original?: number | null
          rating?: number | null
          reviews_count?: number
          slug?: string
          specs?: Json | null
          vendor?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          answer_content: string | null
          answered_at: string | null
          author_name: string
          content: string
          created_at: string | null
          expert_id: string | null
          id: string
          pillar: string | null
          status: string | null
        }
        Insert: {
          answer_content?: string | null
          answered_at?: string | null
          author_name: string
          content: string
          created_at?: string | null
          expert_id?: string | null
          id?: string
          pillar?: string | null
          status?: string | null
        }
        Update: {
          answer_content?: string | null
          answered_at?: string | null
          author_name?: string
          content?: string
          created_at?: string | null
          expert_id?: string | null
          id?: string
          pillar?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_items: {
        Row: {
          created_at: string
          id: string
          item_type: string
          metadata: Json | null
          referenced_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_type: string
          metadata?: Json | null
          referenced_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_type?: string
          metadata?: Json | null
          referenced_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_documents: {
        Row: {
          content: string
          id: string
          last_updated_at: string | null
          slug: string
          title: string
        }
        Insert: {
          content: string
          id?: string
          last_updated_at?: string | null
          slug: string
          title: string
        }
        Update: {
          content?: string
          id?: string
          last_updated_at?: string | null
          slug?: string
          title?: string
        }
        Relationships: []
      }
      system_cron_logs: {
        Row: {
          details: Json | null
          duplicates_blocked: number | null
          id: string
          items_processed: number | null
          job_name: string
          run_time: string | null
          status: string
        }
        Insert: {
          details?: Json | null
          duplicates_blocked?: number | null
          id?: string
          items_processed?: number | null
          job_name: string
          run_time?: string | null
          status: string
        }
        Update: {
          details?: Json | null
          duplicates_blocked?: number | null
          id?: string
          items_processed?: number | null
          job_name?: string
          run_time?: string | null
          status?: string
        }
        Relationships: []
      }
      translated_articles: {
        Row: {
          article_id: string | null
          compiled_at: string
          content_html_translated: string
          id: string
          locale: string
          title_translated: string
        }
        Insert: {
          article_id?: string | null
          compiled_at?: string
          content_html_translated: string
          id?: string
          locale: string
          title_translated: string
        }
        Update: {
          article_id?: string | null
          compiled_at?: string
          content_html_translated?: string
          id?: string
          locale?: string
          title_translated?: string
        }
        Relationships: [
          {
            foreignKeyName: "translated_articles_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "canonical_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      translated_blocks: {
        Row: {
          locale: string
          provider_used: string
          text_hash: string
          translated_text: string
          updated_at: string
        }
        Insert: {
          locale: string
          provider_used: string
          text_hash: string
          translated_text: string
          updated_at?: string
        }
        Update: {
          locale?: string
          provider_used?: string
          text_hash?: string
          translated_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "translated_blocks_text_hash_fkey"
            columns: ["text_hash"]
            isOneToOne: false
            referencedRelation: "translation_memory"
            referencedColumns: ["text_hash"]
          },
        ]
      }
      translation_cache: {
        Row: {
          content_hash: string
          created_at: string
          id: string
          last_accessed: string
          provider_used: string
          source_lang: string
          source_text: string
          target_lang: string
          translated_text: string
        }
        Insert: {
          content_hash: string
          created_at?: string
          id?: string
          last_accessed?: string
          provider_used: string
          source_lang?: string
          source_text: string
          target_lang: string
          translated_text: string
        }
        Update: {
          content_hash?: string
          created_at?: string
          id?: string
          last_accessed?: string
          provider_used?: string
          source_lang?: string
          source_text?: string
          target_lang?: string
          translated_text?: string
        }
        Relationships: []
      }
      translation_memory: {
        Row: {
          created_at: string
          original_text: string
          text_hash: string
        }
        Insert: {
          created_at?: string
          original_text: string
          text_hash: string
        }
        Update: {
          created_at?: string
          original_text?: string
          text_hash?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          bloom_points: number
          current_streak: number
          last_login_date: string
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bloom_points?: number
          current_streak?: number
          last_login_date?: string
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bloom_points?: number
          current_streak?: number
          last_login_date?: string
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          bloom_points: number | null
          created_at: string
          default_locale: string
          display_name: string | null
          email: string
          id: string
          is_active: boolean | null
          preferences: Json | null
          role: string | null
          subscription_tier: string
          updated_at: string
        }
        Insert: {
          bloom_points?: number | null
          created_at?: string
          default_locale?: string
          display_name?: string | null
          email: string
          id: string
          is_active?: boolean | null
          preferences?: Json | null
          role?: string | null
          subscription_tier?: string
          updated_at?: string
        }
        Update: {
          bloom_points?: number | null
          created_at?: string
          default_locale?: string
          display_name?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          preferences?: Json | null
          role?: string | null
          subscription_tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string
          description: string | null
          duration: number | null
          embed_id: string | null
          id: string
          is_active: boolean
          locale: string | null
          pillar: string
          platform: string
          provider: string | null
          slug: string
          thumbnail_url: string | null
          title: string
          transcript: string | null
          video_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: number | null
          embed_id?: string | null
          id?: string
          is_active?: boolean
          locale?: string | null
          pillar: string
          platform?: string
          provider?: string | null
          slug: string
          thumbnail_url?: string | null
          title: string
          transcript?: string | null
          video_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number | null
          embed_id?: string | null
          id?: string
          is_active?: boolean
          locale?: string | null
          pillar?: string
          platform?: string
          provider?: string | null
          slug?: string
          thumbnail_url?: string | null
          title?: string
          transcript?: string | null
          video_id?: string
        }
        Relationships: []
      }
      website_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_bloom_points_secure: {
        Args: { points_delta_param: number; user_id_param: string }
        Returns: undefined
      }
      award_points_secure:
        | {
            Args: { p_action_type: string; p_points: number; p_user_id: string }
            Returns: number
          }
        | {
            Args: { amount: number; user_id_param: string }
            Returns: undefined
          }
      decay_trending_scores: { Args: never; Returns: undefined }
      elevate_to_admin: { Args: { email_param: string }; Returns: undefined }
      get_approved_sponsors_by_pillar: {
        Args: { p_limit?: number; p_pillar: string }
        Returns: {
          bio: string | null
          citation_count: number | null
          created_at: string | null
          display_name: string
          entity_type: Database["public"]["Enums"]["profile_entity_type"] | null
          google_scholar_url: string | null
          h_index: number | null
          id: string
          last_verified_at: string | null
          logo_url: string | null
          orcid_id: string | null
          pillar_specialty: string | null
          status: Database["public"]["Enums"]["profile_status"] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          website_url: string | null
          wikidata_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "expert_profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_latest_videos: {
        Args: { p_limit?: number; p_locale?: string; p_pillar?: string }
        Returns: {
          created_at: string
          embed_id: string
          id: string
          locale: string
          pillar: string
          provider: string
          title: string
        }[]
      }
      get_new_posts: {
        Args: { p_limit?: number }
        Returns: {
          author: string | null
          author_id: string | null
          author_type: Database["public"]["Enums"]["author_category"] | null
          content: string
          created_at: string
          description: string | null
          hash_id: string | null
          id: string
          image_url: string | null
          is_active: boolean
          link: string | null
          pillar: string
          pub_date: string | null
          reviewer_notes: string | null
          slug: string
          source_url: string | null
          sponsor_id: string | null
          status:
            | Database["public"]["Enums"]["article_publishing_status"]
            | null
          title: string
          updated_at: string | null
          view_count: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "articles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_popular_posts_by_pillar: {
        Args: { p_limit?: number; p_pillar: string }
        Returns: {
          author: string | null
          author_id: string | null
          author_type: Database["public"]["Enums"]["author_category"] | null
          content: string
          created_at: string
          description: string | null
          hash_id: string | null
          id: string
          image_url: string | null
          is_active: boolean
          link: string | null
          pillar: string
          pub_date: string | null
          reviewer_notes: string | null
          slug: string
          source_url: string | null
          sponsor_id: string | null
          status:
            | Database["public"]["Enums"]["article_publishing_status"]
            | null
          title: string
          updated_at: string | null
          view_count: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "articles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_random_posts_by_pillar: {
        Args: { p_limit?: number; p_pillar: string }
        Returns: {
          author: string | null
          author_id: string | null
          author_type: Database["public"]["Enums"]["author_category"] | null
          content: string
          created_at: string
          description: string | null
          hash_id: string | null
          id: string
          image_url: string | null
          is_active: boolean
          link: string | null
          pillar: string
          pub_date: string | null
          reviewer_notes: string | null
          slug: string
          source_url: string | null
          sponsor_id: string | null
          status:
            | Database["public"]["Enums"]["article_publishing_status"]
            | null
          title: string
          updated_at: string | null
          view_count: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "articles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      increment_content_view: {
        Args: {
          p_category: string
          p_slug: string
          p_title: string
          p_type: string
          p_user_id?: string
        }
        Returns: undefined
      }
      increment_user_bloom_points: {
        Args: { amount: number; user_id_param: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      prune_old_api_health_logs: { Args: never; Returns: undefined }
      update_user_role_secure: {
        Args: { new_role_param: string; user_id_param: string }
        Returns: undefined
      }
    }
    Enums: {
      article_publishing_status:
        | "draft"
        | "pending_review"
        | "approved"
        | "rejected"
      author_category: "user" | "expert" | "partner" | "sponsor" | "admin"
      profile_entity_type:
        | "individual"
        | "organization"
        | "brand"
        | "institution"
      profile_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      article_publishing_status: [
        "draft",
        "pending_review",
        "approved",
        "rejected",
      ],
      author_category: ["user", "expert", "partner", "sponsor", "admin"],
      profile_entity_type: [
        "individual",
        "organization",
        "brand",
        "institution",
      ],
      profile_status: ["pending", "approved", "rejected"],
    },
  },
} as const

