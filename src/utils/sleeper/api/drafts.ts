import { SLEEPER_API_BASE } from './config';

export const getSleeperUserDrafts = async (
  userId: string,
  sport: string = 'nfl',
  season: string = '2024'
) => {
  console.log('Fetching user drafts:', userId, 'season:', season);
  const response = await fetch(`${SLEEPER_API_BASE}/user/${userId}/drafts/${sport}/${season}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch user drafts: ${response.statusText}`);
  }
  return response.json();
};

export const getSleeperLeagueDrafts = async (leagueId: string) => {
  console.log('Fetching league drafts:', leagueId);
  const response = await fetch(`${SLEEPER_API_BASE}/league/${leagueId}/drafts`);
  if (!response.ok) {
    throw new Error(`Failed to fetch league drafts: ${response.statusText}`);
  }
  return response.json();
};

export const getSleeperDraft = async (draftId: string) => {
  console.log('Fetching draft:', draftId);
  const response = await fetch(`${SLEEPER_API_BASE}/draft/${draftId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch draft: ${response.statusText}`);
  }
  return response.json();
};

export const getSleeperDraftPicks = async (draftId: string) => {
  console.log('Fetching draft picks:', draftId);
  const response = await fetch(`${SLEEPER_API_BASE}/draft/${draftId}/picks`);
  if (!response.ok) {
    throw new Error(`Failed to fetch draft picks: ${response.statusText}`);
  }
  return response.json();
};

export const getSleeperDraftTradedPicks = async (draftId: string) => {
  console.log('Fetching draft traded picks:', draftId);
  const response = await fetch(`${SLEEPER_API_BASE}/draft/${draftId}/traded_picks`);
  if (!response.ok) {
    throw new Error(`Failed to fetch draft traded picks: ${response.statusText}`);
  }
  return response.json();
};