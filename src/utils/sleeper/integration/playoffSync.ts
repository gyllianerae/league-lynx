import { supabase } from "@/integrations/supabase/client";
import { getSleeperPlayoffBracket } from "@/utils/sleeper";
import { BracketType } from "@/types/sleeper/playoff";
import { LeagueStatus } from "@/types/database/common";

export const syncPlayoffBrackets = async (
  sleeperLeagueId: string,
  dbLeagueId: number,
  leagueStatus: LeagueStatus
) => {
  if (leagueStatus !== 'complete' && leagueStatus !== 'in_season') {
    return;
  }

  try {
    const bracketTypes: BracketType[] = ['winners', 'losers'];
    
    for (const bracketType of bracketTypes) {
      try {
        const bracket = await getSleeperPlayoffBracket(sleeperLeagueId, bracketType);
        
        if (bracket && Array.isArray(bracket)) {
          const bracketPromises = bracket.map(async (match) => {
            const { error: bracketError } = await supabase
              .from('playoff_brackets')
              .insert({
                league_id: dbLeagueId,
                bracket_type: bracketType,
                round: match.r,
                match_id: match.m,
                team1_roster_id: typeof match.t1 === 'number' ? match.t1 : null,
                team2_roster_id: typeof match.t2 === 'number' ? match.t2 : null,
                winner_roster_id: match.w,
                loser_roster_id: match.l,
                team1_from: match.t1_from || null,
                team2_from: match.t2_from || null,
                position: match.p
              });

            if (bracketError) throw bracketError;
          });

          await Promise.all(bracketPromises);
        }
      } catch (error) {
        console.error(`Failed to fetch or store ${bracketType} bracket:`, error);
        // Continue with other bracket type even if one fails
      }
    }
  } catch (error) {
    console.error('Error syncing playoff brackets:', error);
    throw error;
  }
};