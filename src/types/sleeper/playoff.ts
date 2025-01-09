export interface SleeperBracketMatch {
  r: number; // round
  m: number; // match id
  t1: number | null; // team 1 roster id
  t2: number | null; // team 2 roster id
  w: number | null; // winner roster id
  l: number | null; // loser roster id
  t1_from?: { w?: number; l?: number }; // where team 1 comes from
  t2_from?: { w?: number; l?: number }; // where team 2 comes from
  p?: number; // position
}

export type BracketType = 'winners' | 'losers';