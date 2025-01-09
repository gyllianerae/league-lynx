import { SLEEPER_API_BASE } from './config';
import { SleeperLeague, SleeperRoster } from '@/types/sleeper/league';
import { SleeperUser } from '@/types/sleeper/user';

export const getSleeperLeagues = async (
  userId: string, 
  sport: string = 'nfl', 
  season: string = '2025'
): Promise<SleeperLeague[]> => {
  const endpoint = `${SLEEPER_API_BASE}/user/${userId}/leagues/${sport}/${season}`;
  console.log('🔍 Fetching Sleeper leagues:', {
    endpoint,
    method: 'GET',
    params: { userId, sport, season },
    timestamp: new Date().toISOString()
  });

  const response = await fetch(endpoint);
  if (!response.ok) {
    console.error('❌ Sleeper API error:', {
      endpoint,
      status: response.status,
      statusText: response.statusText,
      timestamp: new Date().toISOString()
    });
    throw new Error(`Failed to fetch Sleeper leagues: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ Sleeper leagues retrieved:', {
    endpoint,
    leaguesCount: data.length,
    timestamp: new Date().toISOString()
  });
  return data;
};

export const getSleeperLeagueUsers = async (leagueId: string): Promise<SleeperUser[]> => {
  const endpoint = `${SLEEPER_API_BASE}/league/${leagueId}/users`;
  console.log('🔍 Fetching league users:', {
    endpoint,
    method: 'GET',
    params: { leagueId },
    timestamp: new Date().toISOString()
  });

  const response = await fetch(endpoint);
  if (!response.ok) {
    console.error('❌ Sleeper API error:', {
      endpoint,
      status: response.status,
      statusText: response.statusText,
      timestamp: new Date().toISOString()
    });
    throw new Error(`Failed to fetch league users: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ League users retrieved:', {
    endpoint,
    usersCount: data.length,
    timestamp: new Date().toISOString()
  });
  return data;
};

export const getSleeperRosters = async (leagueId: string): Promise<SleeperRoster[]> => {
  const endpoint = `${SLEEPER_API_BASE}/league/${leagueId}/rosters`;
  console.log('🔍 Fetching league rosters:', {
    endpoint,
    method: 'GET',
    params: { leagueId },
    timestamp: new Date().toISOString()
  });

  const response = await fetch(endpoint);
  if (!response.ok) {
    console.error('❌ Sleeper API error:', {
      endpoint,
      status: response.status,
      statusText: response.statusText,
      timestamp: new Date().toISOString()
    });
    throw new Error(`Failed to fetch league rosters: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ League rosters retrieved:', {
    endpoint,
    rostersCount: data.length,
    timestamp: new Date().toISOString()
  });
  return data;
};