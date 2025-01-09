import { SLEEPER_API_BASE } from './config';
import { SleeperUser } from '@/types/sleeper/user';

export const getSleeperUserByUsername = async (username: string): Promise<SleeperUser> => {
  const endpoint = `${SLEEPER_API_BASE}/user/${username}`;
  console.log('🔍 Fetching Sleeper user data:', {
    endpoint,
    method: 'GET',
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
    throw new Error(`Failed to fetch Sleeper user: ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('✅ Sleeper API response:', {
    endpoint,
    data,
    timestamp: new Date().toISOString()
  });
  return data;
};

export const getSleeperUserById = async (userId: string): Promise<SleeperUser> => {
  const endpoint = `${SLEEPER_API_BASE}/user/${userId}`;
  console.log('🔍 Fetching Sleeper user data:', {
    endpoint,
    method: 'GET',
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
    throw new Error(`Failed to fetch Sleeper user: ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('✅ Sleeper API response:', {
    endpoint,
    data,
    timestamp: new Date().toISOString()
  });
  return data;
};