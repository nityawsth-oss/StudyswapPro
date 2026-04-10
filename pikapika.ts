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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      books: {
        Row: {
          author: string | null
          combo_items: string | null
          condition: string | null
          created_at: string
          delivery_days: number | null
          description: string | null
          id: string
          image_url: string | null
          is_combo: boolean | null
          latitude: number | null
          location_name: string | null
          longitude: number | null
          price: number | null
          quantity: number
          seller_phone: string | null
          subject: string | null
          title: string
          user_id: string
        }
        Insert: {
          author?: string | null
          combo_items?: string | null
          condition?: string | null
          created_at?: string
          delivery_days?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_combo?: boolean | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          price?: number | null
          quantity?: number
          seller_phone?: string | null
          subject?: string | null
          title: string
          user_id: string
        }
        Update: {
          author?: string | null
          combo_items?: string | null
          condition?: string | null
          created_at?: string
          delivery_days?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_combo?: boolean | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          price?: number | null
          quantity?: number
          seller_phone?: string | null
          subject?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      doubts: {
        Row: {
          answered: boolean | null
          created_at: string
          id: string
          question: string
          subject: string | null
          user_id: string
        }
        Insert: {
          answered?: boolean | null
          created_at?: string
          id?: string
          question: string
          subject?: string | null
          user_id: string
        }
        Update: {
          answered?: boolean | null
          created_at?: string
          id?: string
          question?: string
          subject?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          file_url: string | null
          id: string
          subject: string | null
          title: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          subject?: string | null
          title: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          subject?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          book_id: string | null
          book_title: string
          buyer_id: string
          created_at: string
          expected_delivery: string | null
          id: string
          order_date: string
          price: number | null
          quantity: number
          seller_id: string
          status: string
        }
        Insert: {
          book_id?: string | null
          book_title: string
          buyer_id: string
          created_at?: string
          expected_delivery?: string | null
          id?: string
          order_date?: string
          price?: number | null
          quantity?: number
          seller_id: string
          status?: string
        }
        Update: {
          book_id?: string | null
          book_title?: string
          buyer_id?: string
          created_at?: string
          expected_delivery?: string | null
          id?: string
          order_date?: string
          price?: number | null
          quantity?: number
          seller_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const
