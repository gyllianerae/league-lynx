import { supabase } from '@/integrations/supabase/client';
import { getSleeperUserByUsername } from '@/utils/sleeper/api/users';
import { toast } from 'sonner';

export const getSleeperUsernameFromProfile = async (userId: string) => {
  console.log('Fetching Sleeper username for user:', userId);
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('sleeper_username')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    throw new Error('Failed to fetch user profile');
  }

  if (!profile?.sleeper_username) {
    console.error('No Sleeper username found in profile');
    // toast.error('Please connect your Sleeper account first');
    throw new Error('No Sleeper username found in profile');
  }

  console.log('Found Sleeper username:', profile.sleeper_username);
  return profile.sleeper_username;
};

export const getSleeperUserData = async (sleeperUsername: string) => {
  console.log('Getting Sleeper user data using username:', sleeperUsername);
  try {
    const sleeperUser = await getSleeperUserByUsername(sleeperUsername);
    
    if (!sleeperUser || !sleeperUser.user_id) {
      console.error('Failed to fetch Sleeper user data');
      toast.error('Failed to fetch Sleeper user data. Please check your username.');
      throw new Error('Failed to fetch Sleeper user data');
    }
    
    console.log('Sleeper user data retrieved:', sleeperUser);
    return sleeperUser;
  } catch (error: any) {
    console.error('Error fetching Sleeper user data:', error);
    toast.error('Failed to fetch Sleeper user data. Please check your username.');
    throw error;
  }
};