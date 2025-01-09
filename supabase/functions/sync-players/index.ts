import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SleeperPlayer {
  player_id: string;
  first_name: string | null;
  last_name: string | null;
  team: string | null;
  position: string | null;
  depth_chart_position: number | null;
  depth_chart_order: number | null;
  age: number | null;
  number: number | null;
  height: string | null;
  weight: string | null;
  college: string | null;
  fantasy_positions: string[] | null;
  status: string | null;
  injury_status: string | null;
  injury_start_date: string | null;
  sport: string;
  active: boolean;
  metadata: Record<string, unknown>;
  search_rank: number | null;
}

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    console.log('Starting player sync process...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const response = await fetch('https://api.sleeper.app/v1/players/nfl');
    if (!response.ok) {
      throw new Error(`Failed to fetch players: ${response.statusText}`);
    }

    const playersData = await response.json();
    console.log(`Fetched ${Object.keys(playersData).length} players from Sleeper API`);

    const batchSize = 100;
    const playerEntries = Object.entries(playersData);
    const batches = Math.ceil(playerEntries.length / batchSize);

    for (let i = 0; i < batches; i++) {
      const batch = playerEntries.slice(i * batchSize, (i + 1) * batchSize);
      const formattedPlayers = batch.map(([playerId, data]: [string, any]) => {
        // Ensure numeric fields are properly typed
        const depth_chart_position = data.depth_chart_position ? 
          parseInt(data.depth_chart_position) : null;
        const depth_chart_order = data.depth_chart_order ? 
          parseInt(data.depth_chart_order) : null;
        const age = data.age ? parseInt(data.age) : null;
        const number = data.number ? parseInt(data.number) : null;
        const search_rank = data.search_rank ? parseInt(data.search_rank) : null;

        // Create metadata object with additional fields
        const metadata = {
          hashtag: data.hashtag,
          sportradar_id: data.sportradar_id,
          fantasy_data_id: data.fantasy_data_id,
          stats_id: data.stats_id,
          birth_country: data.birth_country,
          espn_id: data.espn_id,
          rotowire_id: data.rotowire_id,
          rotoworld_id: data.rotoworld_id,
          yahoo_id: data.yahoo_id,
          years_exp: data.years_exp,
          practice_participation: data.practice_participation,
        };

        return {
          player_id: playerId,
          first_name: data.first_name || null,
          last_name: data.last_name || null,
          team: data.team || null,
          position: data.position || null,
          depth_chart_position,
          depth_chart_order,
          age,
          number,
          height: data.height || null,
          weight: data.weight || null,
          college: data.college || null,
          fantasy_positions: data.fantasy_positions || null,
          status: data.status || null,
          injury_status: data.injury_status || null,
          injury_start_date: data.injury_start_date || null,
          sport: 'nfl',
          active: true,
          metadata,
          search_rank,
        };
      });

      console.log(`Upserting batch ${i + 1} of ${batches} (${formattedPlayers.length} players)`);
      const { error } = await supabase
        .from('players')
        .upsert(formattedPlayers, {
          onConflict: 'player_id',
          ignoreDuplicates: false,
        });

      if (error) {
        console.error(`Error upserting batch ${i + 1}:`, error);
        throw error;
      }
      console.log(`Successfully upserted batch ${i + 1}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully synced ${playerEntries.length} players` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sync-players function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});