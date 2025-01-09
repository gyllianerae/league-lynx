import { SleeperUser } from "../sleeper/user";

export interface MarketplaceListing {
  id: number;
  title: string;
  description?: string;
  commissioner: SleeperUser;
  season: string;
  prize_pool?: number;
  total_spots: number;
  filled_spots: number;
  draft_date?: string;
  entry_fee?: number;
  image?: string;
}