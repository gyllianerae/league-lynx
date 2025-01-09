export interface SleeperLeague {
  total_rosters: number;
  status: 'pre_draft' | 'drafting' | 'in_season' | 'complete';
  sport: string;
  settings: Record<string, any>;
  season_type: string;
  season: string;
  scoring_settings: Record<string, any>;
  roster_positions: string[];
  previous_league_id: string | null;
  name: string;
  league_id: string;
  draft_id: string | null;
  avatar: string | null;
}

export interface SleeperRoster {
  starters: string[];
  settings: {
    wins: number;
    waiver_position: number;
    waiver_budget_used: number;
    total_moves: number;
    ties: number;
    losses: number;
    fpts_decimal: number;
    fpts_against_decimal: number;
    fpts_against: number;
    fpts: number;
  };
  roster_id: number;
  reserve: string[];
  players: string[];
  owner_id: string;
  league_id: string;
  team_name?: string;
  owner?: any;
}

export interface SleeperMatchup {
  starters: string[];
  roster_id: number;
  players: string[];
  matchup_id: number;
  points: number;
  custom_points: number | null;
}

export type LeagueStatus = 'pre_draft' | 'drafting' | 'in_season' | 'complete';