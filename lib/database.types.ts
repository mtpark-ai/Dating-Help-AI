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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_questions: {
        Row: {
          id: string
          email: string
          question: string
          status: string
          admin_response: string | null
          created_at: string
          updated_at: string
          admin_updated_at: string | null
        }
        Insert: {
          id?: string
          email: string
          question: string
          status?: string
          admin_response?: string | null
          created_at?: string
          updated_at?: string
          admin_updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          question?: string
          status?: string
          admin_response?: string | null
          created_at?: string
          updated_at?: string
          admin_updated_at?: string | null
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          id: string
          user_id: string | null
          email: string
          rating: number
          thoughts: string | null
          follow_up: boolean
          page_source: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email: string
          rating: number
          thoughts?: string | null
          follow_up: boolean
          page_source: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string
          rating?: number
          thoughts?: string | null
          follow_up?: boolean
          page_source?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
