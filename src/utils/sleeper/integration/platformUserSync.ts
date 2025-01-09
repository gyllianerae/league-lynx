import { supabase } from "@/integrations/supabase/client";
import { SleeperUser } from "@/types/sleeper/user";

export const syncPlatformUser = async (userId: string, sleeperUser: SleeperUser) => {
  console.log('Syncing platform user for:', userId, sleeperUser);
  
  try {
    const { data: platformUser, error: platformUserError } = await supabase
      .from('platform_users')
      .upsert({
        profile_id: userId,
        platform_id: 1, // Sleeper platform ID
        username: sleeperUser.username,
        display_name: sleeperUser.display_name,
        avatar_id: sleeperUser.avatar,
        sport: 'football',
        season: '2025'
      }, {
        onConflict: 'profile_id',
        ignoreDuplicates: false
      })
      .select()
      .maybeSingle();

    if (platformUserError) {
      console.error('Error syncing platform user:', platformUserError);
      throw platformUserError;
    }

    console.log('Successfully synced platform user:', platformUser);
    return platformUser;
  } catch (error) {
    console.error('Error syncing platform user:', error);
    throw error;
  }
};