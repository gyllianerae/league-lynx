export interface LeagueMember {
  id: number;
  league_id: number;
  sleeper_user_id: string;
  username: string;
  display_name: string | null;
  avatar_id: string | null;
  is_commissioner: boolean;
  team_name: string | null;
  platform_user_id: number | null;
  is_online: boolean;
  last_online: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeagueMemberInsert extends Omit<LeagueMember, 'id' | 'created_at' | 'updated_at'> {
  id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface LeagueMemberUpdate extends Partial<LeagueMemberInsert> {}