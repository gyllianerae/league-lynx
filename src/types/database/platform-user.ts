export interface PlatformUser {
  id: number;
  profile_id: string;
  platform_id: number;
  username: string;
  display_name?: string | null;
  avatar_id?: string | null;
  sport: 'football';
  season: string;
  created_at: string;
  updated_at: string;
}