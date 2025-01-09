import { SleeperUser } from '@/types/sleeper/user';
import { SleeperLeague, SleeperRoster } from '@/types/sleeper/league';
import { SleeperBracketMatch, BracketType } from '@/types/sleeper/playoff';

const SLEEPER_API_BASE = 'https://api.sleeper.app/v1';

export const getSleeperUserByUsername = async (username: string): Promise<SleeperUser> => {
  const response = await fetch(`${SLEEPER_API_BASE}/user/${username}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch Sleeper user: ${response.statusText}`);
  }
  return response.json();
};

export const getSleeperLeagues = async (
  userId: string, 
  sport: string = 'nfl', 
  season: string = '2024'
): Promise<SleeperLeague[]> => {
  const response = await fetch(`${SLEEPER_API_BASE}/user/${userId}/leagues/${sport}/${season}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch Sleeper leagues: ${response.statusText}`);
  }
  return response.json();
};

export const getSleeperLeague = async (leagueId: string): Promise<SleeperLeague> => {
  const response = await fetch(`${SLEEPER_API_BASE}/league/${leagueId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch Sleeper league: ${response.statusText}`);
  }
  return response.json();
};

export const getSleeperLeagueUsers = async (leagueId: string): Promise<SleeperUser[]> => {
  const response = await fetch(`${SLEEPER_API_BASE}/league/${leagueId}/users`);
  if (!response.ok) {
    throw new Error(`Failed to fetch Sleeper league users: ${response.statusText}`);
  }
  return response.json();
};

export const getAvatarUrl = (avatarId: string | null, thumbnail: boolean = false): string => {
  if (!avatarId) return '/placeholder.svg';
  const path = thumbnail ? 'thumbs/' : '';
  return `https://sleepercdn.com/avatars/${path}${avatarId}`;
};

export const getSleeperRosters = async (leagueId: string): Promise<SleeperRoster[]> => {
  const response = await fetch(`${SLEEPER_API_BASE}/league/${leagueId}/rosters`);
  if (!response.ok) {
    throw new Error(`Failed to fetch league rosters: ${response.statusText}`);
  }
  const rosters = await response.json();
  
  // Fetch user data for each roster owner
  const ownerPromises = rosters.map(async (roster: SleeperRoster) => {
    if (roster.owner_id) {
      try {
        const userResponse = await fetch(`${SLEEPER_API_BASE}/user/${roster.owner_id}`);
        if (userResponse.ok) {
          roster.owner = await userResponse.json();
        }
      } catch (error) {
        console.error(`Failed to fetch owner data for roster ${roster.roster_id}:`, error);
      }
    }
    return roster;
  });
  
  return Promise.all(ownerPromises);
};

export const getSleeperPlayoffBracket = async (
  leagueId: string, 
  bracketType: BracketType
): Promise<SleeperBracketMatch[]> => {
  const response = await fetch(`${SLEEPER_API_BASE}/league/${leagueId}/${bracketType}_bracket`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${bracketType} bracket: ${response.statusText}`);
  }
  return response.json();
};