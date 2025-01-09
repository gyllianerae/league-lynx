export type TransactionType = 'free_agent' | 'waiver' | 'trade';

export interface WaiverBudget {
  sender: number;
  receiver: number;
  amount: number;
}

export interface DraftPick {
  season: string;
  round: number;
  roster_id: number;
  previous_owner_id: number;
  owner_id: number;
}

export interface SleeperTransaction {
  type: TransactionType;
  transaction_id: string;
  status_updated: number;
  status: string;
  settings: { waiver_bid?: number } | null;
  roster_ids: number[];
  metadata: any;
  leg: number;
  drops: Record<string, number> | null;
  draft_picks: DraftPick[];
  creator: string;
  created: number;
  consenter_ids: number[];
  adds: Record<string, number> | null;
  waiver_budget: WaiverBudget[];
}

export interface TransactionPlayer {
  player_id: string;
  name: string;
  team: string;
  position: string;
  status: string;
  from_team?: string;
}