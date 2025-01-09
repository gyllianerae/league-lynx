export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type SportType = 'football';
export type LeagueStatus = 'pre_draft' | 'drafting' | 'in_season' | 'complete';