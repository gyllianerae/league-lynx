import { supabase } from "@/integrations/supabase/client";
import { getSleeperUserByUsername, getSleeperLeagues } from "@/utils/sleeper";
import { toast } from "sonner";
import { syncLeague } from "./sleeper/integration/leagueSync";
import { Json } from "@/integrations/supabase/types";

export const handleSleeperIntegration = async (userId: string, sleeperUsername: string) => {
  try {
    console.log('Starting Sleeper integration for user:', userId, 'with username:', sleeperUsername);
    
    // Get Sleeper user data
    const sleeperUser = await getSleeperUserByUsername(sleeperUsername);
    if (!sleeperUser) {
      throw new Error("Failed to fetch Sleeper user data");
    }
    
    console.log('Fetched Sleeper user:', sleeperUser);

    // First, update the profile with the Sleeper username
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        sleeper_username: sleeperUsername,
        onboarding_status: 'completed'
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      throw profileError;
    }

    console.log('Updated profile with Sleeper username');

    // First check if platform user exists
    const { data: existingPlatformUser, error: fetchError } = await supabase
      .from('platform_users')
      .select('*')
      .eq('profile_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error checking existing platform user:', fetchError);
      throw fetchError;
    }

    let platformUser;
    
    if (existingPlatformUser) {
      // Update existing platform user
      console.log('Updating existing platform user');
      const { data: updatedUser, error: updateError } = await supabase
        .from('platform_users')
        .update({
          username: sleeperUser.username,
          display_name: sleeperUser.display_name,
          avatar_id: sleeperUser.avatar,
          sport: 'football',
          season: '2025'
        })
        .eq('profile_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating platform user:', updateError);
        throw updateError;
      }
      platformUser = updatedUser;
    } else {
      // Create new platform user
      console.log('Creating new platform user');
      const { data: newUser, error: insertError } = await supabase
        .from('platform_users')
        .insert({
          profile_id: userId,
          platform_id: 1, // Sleeper platform ID
          username: sleeperUser.username,
          display_name: sleeperUser.display_name,
          avatar_id: sleeperUser.avatar,
          sport: 'football',
          season: '2025'
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating platform user:', insertError);
        throw insertError;
      }
      platformUser = newUser;
    }

    console.log('Platform user operation successful:', platformUser);

    // Fetch and sync user's leagues
    const leagues = await getSleeperLeagues(sleeperUser.user_id);
    if (!leagues || leagues.length === 0) {
      console.log('No leagues found for user');
      return platformUser;
    }
    
    console.log('Fetched leagues:', leagues);

    // Process each league
    await Promise.all(
      leagues.map(league => syncLeague(league, platformUser.id))
    );

    toast.success(`Connected to Sleeper and synced ${leagues.length} leagues.`);

    return platformUser;
  } catch (error: any) {
    console.error('Error in Sleeper integration:', error);
    toast.error(error.message || "Failed to integrate with Sleeper");
    throw error;
  }
};