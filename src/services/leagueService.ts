import { supabase } from '@/integrations/supabase/client';
import { getSleeperLeagues } from '@/utils/sleeper/api/leagues';
import { toast } from 'sonner';

export const fetchAndSyncLeagues = async (userId: string, sleeperUserId: string) => {
  try {
    console.log('Fetching leagues from Sleeper API using user_id:', sleeperUserId);
    const sleeperLeagues = await getSleeperLeagues(sleeperUserId);
    
    if (!sleeperLeagues || !Array.isArray(sleeperLeagues)) {
      console.error('Invalid response from Sleeper API:', sleeperLeagues);
      throw new Error('Failed to fetch leagues from Sleeper');
    }
    
    console.log('Leagues fetched from Sleeper:', sleeperLeagues);

    // Get the platform user ID
    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id')
      .eq('profile_id', userId)
      .single();

    if (!platformUser) {
      throw new Error('Platform user not found');
    }

    // Update the leagues in the database using the Edge Function
    const { data: functionData, error: functionError } = await supabase.functions.invoke(
      'fetch-user-leagues',
      {
        body: {
          userId,
          leagues: sleeperLeagues
        },
      }
    );

    if (functionError) {
      console.error('Error invoking fetch-user-leagues:', functionError);
      throw functionError;
    }

    // Fetch the updated leagues from the database
    const { data: dbLeagues, error: dbError } = await supabase
      .from('leagues')
      .select(`
        *,
        league_members!inner(*)
      `)
      .eq('platform_user_id', platformUser.id);

    if (dbError) {
      console.error('Error fetching leagues from database:', dbError);
      throw dbError;
    }

    return dbLeagues || [];
  } catch (error: any) {
    console.error('Error in league fetching process:', error);
    throw new Error(error.message || 'Failed to fetch leagues from Sleeper');
  }
};