import { supabase } from '@/integrations/supabase/client';
import { SleeperLeague } from '@/types/sleeper/league';
import { syncPlayoffBrackets } from './playoffSync';
import { Json } from '@/integrations/supabase/types';

export const syncLeague = async (
  league: SleeperLeague,
  platformUserId: number
) => {
  try {
    // First check if the league already exists
    const { data: existingLeague } = await supabase
      .from('leagues')
      .select('id')
      .eq('league_id', league.league_id)
      .eq('platform_user_id', platformUserId)
      .single();

    if (existingLeague) {
      console.log(`League ${league.league_id} already exists, skipping insert`);
      return existingLeague;
    }

    // Clone the response before using it
    const response = await fetch(`https://api.sleeper.app/v1/league/${league.league_id}`);
    const responseClone = response.clone();
    
    const leagueData = await responseClone.json();

    // If league doesn't exist, proceed with insert
    const { data: insertedLeague, error: leagueError } = await supabase
      .from('leagues')
      .insert({
        platform_user_id: platformUserId,
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
      .single();

    if (leagueError) throw leagueError;
    if (!insertedLeague) throw new Error('Failed to insert league');

    // Only sync playoff brackets for newly inserted leagues
    await syncPlayoffBrackets(league.league_id, insertedLeague.id, league.status as 'pre_draft' | 'drafting' | 'in_season' | 'complete');

    return insertedLeague;
  } catch (error: any) {
    console.error('Error syncing league:', error);
    throw error;
  }
};