export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      leagues: {
        Row: {
          avatar_id: string | null
          created_at: string
          draft_id: string | null
          id: number
          league_id: string
          name: string
          platform_user_id: number
          previous_league_id: string | null
          roster_positions: Json
          scoring_settings: Json
          season: string
          season_type: string
          settings: Json
          sport: Database["public"]["Enums"]["sport_type"]
          status: Database["public"]["Enums"]["league_status"]
          total_rosters: number
          updated_at: string
        }
        Insert: {
          avatar_id?: string | null
          created_at?: string
          draft_id?: string | null
          id?: number
          league_id: string
          name: string
          platform_user_id: number
          previous_league_id?: string | null
          roster_positions?: Json
          scoring_settings?: Json
          season: string
          season_type: string
          settings?: Json
          sport?: Database["public"]["Enums"]["sport_type"]
          status: Database["public"]["Enums"]["league_status"]
          total_rosters: number
          updated_at?: string
        }
        Update: {
          avatar_id?: string | null
          created_at?: string
          draft_id?: string | null
          id?: number
          league_id?: string
          name?: string
          platform_user_id?: number
          previous_league_id?: string | null
          roster_positions?: Json
          scoring_settings?: Json
          season?: string
          season_type?: string
          settings?: Json
          sport?: Database["public"]["Enums"]["sport_type"]
          status?: Database["public"]["Enums"]["league_status"]
          total_rosters?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leagues_platform_user_id_fkey"
            columns: ["platform_user_id"]
            isOneToOne: false
            referencedRelation: "platform_users"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          commissioner_id: string
          created_at: string
          description: string | null
          draft_date: string | null
          entry_fee: number | null
          filled_spots: number
          id: number
          prize_pool: number | null
          season: string
          settings: Json
          sport: Database["public"]["Enums"]["sport_type"]
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          total_spots: number
          updated_at: string
        }
        Insert: {
          commissioner_id: string
          created_at?: string
          description?: string | null
          draft_date?: string | null
          entry_fee?: number | null
          filled_spots?: number
          id?: never
          prize_pool?: number | null
          season: string
          settings?: Json
          sport?: Database["public"]["Enums"]["sport_type"]
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          total_spots: number
          updated_at?: string
        }
        Update: {
          commissioner_id?: string
          created_at?: string
          description?: string | null
          draft_date?: string | null
          entry_fee?: number | null
          filled_spots?: number
          id?: never
          prize_pool?: number | null
          season?: string
          settings?: Json
          sport?: Database["public"]["Enums"]["sport_type"]
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          total_spots?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_commissioner_id_fkey"
            columns: ["commissioner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matchups: {
        Row: {
          created_at: string
          custom_points: number | null
          id: number
          league_id: number
          matchup_id: number
          players: Json
          points: number | null
          roster_id: number
          starters: Json
          updated_at: string
          week: number
        }
        Insert: {
          created_at?: string
          custom_points?: number | null
          id?: number
          league_id: number
          matchup_id: number
          players?: Json
          points?: number | null
          roster_id: number
          starters?: Json
          updated_at?: string
          week: number
        }
        Update: {
          created_at?: string
          custom_points?: number | null
          id?: number
          league_id?: number
          matchup_id?: number
          players?: Json
          points?: number | null
          roster_id?: number
          starters?: Json
          updated_at?: string
          week?: number
        }
        Relationships: [
          {
            foreignKeyName: "matchups_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_users: {
        Row: {
          avatar_id: string | null
          created_at: string
          display_name: string | null
          id: number
          platform_id: number
          profile_id: string
          season: string
          sport: Database["public"]["Enums"]["sport_type"]
          updated_at: string
          username: string
        }
        Insert: {
          avatar_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: number
          platform_id: number
          profile_id: string
          season: string
          sport?: Database["public"]["Enums"]["sport_type"]
          updated_at?: string
          username: string
        }
        Update: {
          avatar_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: number
          platform_id?: number
          profile_id?: string
          season?: string
          sport?: Database["public"]["Enums"]["sport_type"]
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_users_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_users_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platforms: {
        Row: {
          enabled: boolean | null
          id: number
          name: string
        }
        Insert: {
          enabled?: boolean | null
          id?: number
          name: string
        }
        Update: {
          enabled?: boolean | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          active: boolean
          age: number | null
          college: string | null
          depth_chart_order: number | null
          depth_chart_position: number | null
          fantasy_positions: string[] | null
          first_name: string | null
          full_name: string | null
          height: string | null
          image_url: string | null
          injury_start_date: string | null
          injury_status: string | null
          last_name: string | null
          last_updated: string
          metadata: Json
          number: number | null
          player_id: string
          position: string | null
          search_rank: number | null
          sport: string
          status: string | null
          team: string | null
          weight: string | null
        }
        Insert: {
          active?: boolean
          age?: number | null
          college?: string | null
          depth_chart_order?: number | null
          depth_chart_position?: number | null
          fantasy_positions?: string[] | null
          first_name?: string | null
          full_name?: string | null
          height?: string | null
          image_url?: string | null
          injury_start_date?: string | null
          injury_status?: string | null
          last_name?: string | null
          last_updated?: string
          metadata?: Json
          number?: number | null
          player_id: string
          position?: string | null
          search_rank?: number | null
          sport?: string
          status?: string | null
          team?: string | null
          weight?: string | null
        }
        Update: {
          active?: boolean
          age?: number | null
          college?: string | null
          depth_chart_order?: number | null
          depth_chart_position?: number | null
          fantasy_positions?: string[] | null
          first_name?: string | null
          full_name?: string | null
          height?: string | null
          image_url?: string | null
          injury_start_date?: string | null
          injury_status?: string | null
          last_name?: string | null
          last_updated?: string
          metadata?: Json
          number?: number | null
          player_id?: string
          position?: string | null
          search_rank?: number | null
          sport?: string
          status?: string | null
          team?: string | null
          weight?: string | null
        }
        Relationships: []
      }
      playoff_brackets: {
        Row: {
          bracket_type: string
          created_at: string
          id: number
          league_id: number
          loser_roster_id: number | null
          match_id: number
          position: number | null
          round: number
          team1_from: Json | null
          team1_roster_id: number | null
          team2_from: Json | null
          team2_roster_id: number | null
          updated_at: string
          winner_roster_id: number | null
        }
        Insert: {
          bracket_type: string
          created_at?: string
          id?: number
          league_id: number
          loser_roster_id?: number | null
          match_id: number
          position?: number | null
          round: number
          team1_from?: Json | null
          team1_roster_id?: number | null
          team2_from?: Json | null
          team2_roster_id?: number | null
          updated_at?: string
          winner_roster_id?: number | null
        }
        Update: {
          bracket_type?: string
          created_at?: string
          id?: number
          league_id?: number
          loser_roster_id?: number | null
          match_id?: number
          position?: number | null
          round?: number
          team1_from?: Json | null
          team1_roster_id?: number | null
          team2_from?: Json | null
          team2_roster_id?: number | null
          updated_at?: string
          winner_roster_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "playoff_brackets_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          first_name: string | null
          id: string
          last_name: string | null
          onboarding_status: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          selected_season: string | null
          sleeper_username: string | null
          username: string | null
        }
        Insert: {
          first_name?: string | null
          id: string
          last_name?: string | null
          onboarding_status?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          selected_season?: string | null
          sleeper_username?: string | null
          username?: string | null
        }
        Update: {
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_status?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          selected_season?: string | null
          sleeper_username?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      sync_players_daily: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      league_status: "pre_draft" | "drafting" | "in_season" | "complete"
      listing_status: "open" | "closed" | "draft"
      player_position:
        | "QB"
        | "RB"
        | "WR"
        | "TE"
        | "K"
        | "DEF"
        | "FLEX"
        | "SUPER_FLEX"
        | "BENCH"
      sport_type: "football" | "nfl"
      user_role: "regular_user" | "commissioner"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
