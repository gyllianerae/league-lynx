import { SLEEPER_API_BASE } from './config';

export const getSleeperNFLState = async () => {
  console.log('Fetching NFL state');
  const response = await fetch(`${SLEEPER_API_BASE}/state/nfl`);
  if (!response.ok) {
    throw new Error(`Failed to fetch NFL state: ${response.statusText}`);
  }
  return response.json();
};