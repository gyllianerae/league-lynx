import { Json } from './common';

export interface PlayoffBracket {
  id: number;
  league_id: number;
  bracket_type: string;
  round: number;
  match_id: number;
  team1_roster_id: number | null;
  team2_roster_id: number | null;
  winner_roster_id: number | null;
  loser_roster_id: number | null;
  team1_from: Json | null;
  team2_from: Json | null;
  position: number | null;
  created_at: string;
  updated_at: string;
}

export interface PlayoffBracketInsert extends Omit<PlayoffBracket, 'id' | 'created_at' | 'updated_at'> {
  id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PlayoffBracketUpdate extends Partial<PlayoffBracketInsert> {}