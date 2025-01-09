import { SportType } from './common';

export interface PlatformUser {
  id: number;
  profile_id: string;
  platform_id: number;
  username: string;
  display_name: string | null;
  avatar_id: string | null;
  sport: SportType;
  season: string;
  created_at: string;
  updated_at: string;
}

export interface Platform {
  id: number;
  name: string;
  enabled: boolean | null;
}