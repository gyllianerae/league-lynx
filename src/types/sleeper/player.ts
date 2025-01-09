import { Json } from '@/integrations/supabase/types';

export interface SleeperPlayer {
  player_id: string;
  status?: string;
  sport?: string;
  fantasy_positions?: string[];
  number?: number;
  position?: string;
  team?: string;
  last_name?: string;
  first_name?: string;
  full_name?: string;
  age?: number;
  years_exp?: number;
  height?: string;
  weight?: string;
  college?: string;
  injury_status?: string;
  injury_start_date?: string;
  depth_chart_position?: number;
  depth_chart_order?: number;
  active?: boolean;
  metadata?: Json;
  search_rank?: number;
  image_url?: string;
}