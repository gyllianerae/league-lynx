import { Json, SportType, LeagueStatus } from './common';
import { LeagueSettings } from './league-settings';
import { PlatformUser } from './platform-user';

interface LeagueTeam {
  roster_id: number;
  owner_name: string;
  team_name: string;
  avatar?: string;
  wins: number;
  losses: number;
  ties: number;
  fpts: number;
  fpts_decimal: number;
  fpts_against: number;
  fpts_against_decimal: number;
}

export interface League {
  id: number;
  league_id: string;
  platform_user_id: number;
  platform_user?: PlatformUser;
  name: string;
  total_rosters: number;
  status: LeagueStatus;
  sport: SportType;
  season_type: string;
  season: string;
  previous_league_id: string | null;
  draft_id: string | null;
  avatar_id: string | null;
  settings: LeagueSettings;
  scoring_settings: Json;
  roster_positions: Json;
  created_at: string;
  updated_at: string;
  teams?: LeagueTeam[];
}