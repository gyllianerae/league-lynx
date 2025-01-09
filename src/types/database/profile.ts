export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  sleeper_username: string | null;
  role: 'regular_user' | 'commissioner';
  selected_season: string | null;
  onboarding_status: string | null;
}