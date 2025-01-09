export interface LeagueSettings {
  team_name?: string;
  rank?: number;
  wins?: number;
  losses?: number;
  ties?: number;
  fpts?: number;
  fpts_decimal?: number;
  fpts_against?: number;
  fpts_against_decimal?: number;
  [key: string]: any; // For other potential settings
}