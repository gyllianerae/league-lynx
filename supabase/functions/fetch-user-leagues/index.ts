import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  userId: string;
  sleeperUsername: string;
}

interface SleeperRoster {
  roster_id: number;
  owner_id: string;
  league_id: string;
  settings: {
    wins: number;
    losses: number;
    ties: number;
    fpts: number;
    fpts_decimal: number;
    fpts_against: number;
    fpts_against_decimal: number;
  };
}

interface SleeperUser {
  user_id: string;
  display_name: string;
  metadata: {
    team_name?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Edge Function: Starting fetch-user-leagues');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId, sleeperUsername } = await req.json() as RequestBody;
    console.log('Processing request for user:', userId, 'with Sleeper username:', sleeperUsername);

    if (!userId || !sleeperUsername) {
      throw new Error('Missing required parameters');
    }

    // Get Sleeper user ID
    const sleeperUserResponse = await fetch(`https://api.sleeper.app/v1/user/${sleeperUsername}`);
    if (!sleeperUserResponse.ok) {
      throw new Error(`Failed to fetch Sleeper user: ${sleeperUserResponse.statusText}`);
    }
    const sleeperUser = await sleeperUserResponse.json();
    
    // Get platform user
    const { data: platformUser } = await supabaseClient
      .from('platform_users')
      .select()
      .eq('profile_id', userId)
      .single();

    if (!platformUser) {
      throw new Error('Platform user not found');
    }

    // Fetch leagues for both 2024 and 2025 seasons
    const seasons = ['2024', '2025'];
    let allLeagues = [];
    
    for (const season of seasons) {
      console.log(`Fetching leagues for season ${season}`);
      const leaguesResponse = await fetch(
        `https://api.sleeper.app/v1/user/${sleeperUser.user_id}/leagues/nfl/${season}`
      );
      
      if (!leaguesResponse.ok) {
        console.error(`Failed to fetch leagues for season ${season}: ${leaguesResponse.statusText}`);
        continue;
      }
      
      const seasonLeagues = await leaguesResponse.json();
      allLeagues = [...allLeagues, ...seasonLeagues];
    }

    console.log(`Found ${allLeagues.length} leagues across all seasons for user`);

    // Process each league
    for (const league of allLeagues) {
      try {
        // Fetch league users and rosters
        console.log(`Fetching details for league: ${league.league_id}`);
        const [usersResponse, rostersResponse] = await Promise.all([
          fetch(`https://api.sleeper.app/v1/league/${league.league_id}/users`),
          fetch(`https://api.sleeper.app/v1/league/${league.league_id}/rosters`)
        ]);

        if (!usersResponse.ok || !rostersResponse.ok) {
          console.error('Failed to fetch league details');
          continue;
        }

        const [users, rosters] = await Promise.all([
          usersResponse.json(),
          rostersResponse.json()
        ]) as [SleeperUser[], SleeperRoster[]];

        console.log(`Found ${users.length} users and ${rosters.length} rosters in league ${league.league_id}`);

        // Find user's roster and team name
        const userRoster = rosters.find(roster => roster.owner_id === sleeperUser.user_id);
        const userData = users.find(user => user.user_id === sleeperUser.user_id);
        
        console.log('User data found:', userData);
        console.log('User roster found:', userRoster);

        // Get team name from metadata or fallback to display name
        const teamName = userData?.metadata?.team_name || userData?.display_name || `${sleeperUsername}'s Team`;
        const rosterSettings = userRoster?.settings || {};

        // Calculate rank based on points
        const rank = calculateRank(userRoster, rosters);
        console.log(`Calculated rank for user in league ${league.league_id}: ${rank}`);

        // Update league settings with user's team info
        const enhancedSettings = {
          ...league.settings,
          team_name: teamName,
          rank,
          wins: rosterSettings.wins || 0,
          losses: rosterSettings.losses || 0,
          ties: rosterSettings.ties || 0,
          fpts: rosterSettings.fpts || 0,
          fpts_decimal: rosterSettings.fpts_decimal || 0,
          fpts_against: rosterSettings.fpts_against || 0,
          fpts_against_decimal: rosterSettings.fpts_against_decimal || 0,
        };

        // Insert or update league using upsert
        const { error: leagueError } = await supabaseClient
          .from('leagues')
          .upsert({
            league_id: league.league_id,
            platform_user_id: platformUser.id,
            name: league.name,
            total_rosters: league.total_rosters,
            status: league.status,
            sport: league.sport,
            season_type: league.season_type,
            season: league.season,
            previous_league_id: league.previous_league_id,
            draft_id: league.draft_id,
            avatar_id: league.avatar,
            settings: enhancedSettings,
            scoring_settings: league.scoring_settings,
            roster_positions: league.roster_positions
          }, {
            onConflict: 'league_id',
            ignoreDuplicates: false
          });

        if (leagueError) {
          console.error('Error upserting league:', leagueError);
          throw leagueError;
        }

        console.log(`Successfully processed league: ${league.name}`);
      } catch (error) {
        console.error('Error processing league:', league.league_id, error);
      }
    }

    return new Response(
      JSON.stringify({ message: 'Successfully synced leagues', count: allLeagues.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});

// Helper function to calculate rank based on points
function calculateRank(userRoster: SleeperRoster | undefined, rosters: SleeperRoster[]): number {
  if (!userRoster) return 0;
  
  const sortedRosters = [...rosters].sort((a, b) => {
    const aPoints = (a.settings.fpts || 0) + (a.settings.fpts_decimal || 0) / 100;
    const bPoints = (b.settings.fpts || 0) + (b.settings.fpts_decimal || 0) / 100;
    return bPoints - aPoints;
  });

  return sortedRosters.findIndex(roster => roster.roster_id === userRoster.roster_id) + 1;
}