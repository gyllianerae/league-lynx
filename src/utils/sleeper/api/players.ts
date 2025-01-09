import { SLEEPER_API_BASE } from './config';

export const getSleeperPlayers = async (sport: string = 'nfl') => {
  console.log('Fetching all NFL players');
  const response = await fetch(`${SLEEPER_API_BASE}/players/${sport}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch players: ${response.statusText}`);
  }
  const data = await response.json();
  console.log("Fetched all players:", data);  // Debugging log to ensure data is correct
  return data;
};

export const getSleeperTrendingPlayers = async (
  sport: string = 'nfl',
  type: 'add' | 'drop',
  lookbackHours: number = 24,
  limit: number = 25
) => {
  console.log(`Fetching trending players (${type})`);

  const url = `${SLEEPER_API_BASE}/players/${sport}/trending/${type}?lookback_hours=${lookbackHours}&limit=${limit}`;
  
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch trending players: ${response.statusText}`);
    }

    const trendingPlayers = await response.json();

    console.log("Trending Players Data:", trendingPlayers);  // Console log for trending players

    if (Array.isArray(trendingPlayers) && trendingPlayers.length > 0) {
      // console.log(`Fetched ${trendingPlayers.length} trending players:`);
      trendingPlayers.forEach((player, index) => {
        console.log(`Player ${index + 1}:`, player);
      });
    } else {
      console.log("No trending players found.");
    }

    return trendingPlayers;
  } catch (error) {
    console.error("Error fetching trending players:", error);
    throw error;
  }
};
