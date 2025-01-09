import { supabase } from "@/integrations/supabase/client";
import { SleeperUser } from "@/types/sleeper/user";
import { handleSleeperIntegration } from "@/utils/sleeperIntegration";
import { getSleeperLeagues, getSleeperLeagueUsers, getSleeperRosters } from "@/utils/sleeper/api";
import { toast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

export const syncSleeperData = async (userId: string, sleeperUser: SleeperUser) => {
  try {
    console.log('Starting Sleeper data sync for user:', userId);
    
    await handleSleeperIntegration(userId, sleeperUser.username);
    
    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('*')
      .eq('profile_id', userId)
      .maybeSingle();
    
    if (!platformUser) {
      throw new Error('Platform user not found after integration');
    }

    const leagues = await getSleeperLeagues(sleeperUser.user_id);
    
    for (const league of leagues) {
      try {
        const { data: insertedLeague, error: leagueError } = await supabase
          .from('leagues')
          .insert({
            platform_user_id: platformUser.id,
            name: league.name,
            total_rosters: league.total_rosters,
            status: league.status as 'pre_draft' | 'drafting' | 'in_season' | 'complete',
            sport: 'football',
            season_type: league.season_type,
            season: league.season,
            previous_league_id: league.previous_league_id,
            draft_id: league.draft_id,
            avatar_id: league.avatar,
            settings: league.settings as Json,
            scoring_settings: league.scoring_settings as Json,
            roster_positions: league.roster_positions as Json,
            league_id: league.league_id
          })
          .select()
          .maybeSingle();

        if (leagueError) throw leagueError;
        console.log('Successfully processed league:', league.name);
      } catch (error) {
        console.error('Error processing league:', league.league_id, error);
      }
    }

    toast({
      title: "Success!",
      description: `Synced ${leagues.length} leagues from Sleeper.`,
    });
  } catch (error: any) {
    console.error('Error syncing Sleeper data:', error);
    toast({
      title: "Error syncing data",
      description: error.message,
      variant: "destructive",
    });
    throw error;
  }
};