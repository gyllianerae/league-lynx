import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { League } from "@/types/database/league";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trophy, Users, CalendarDays, Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { getSleeperNFLState } from "@/utils/sleeper/api/state";

export default function LeaguePage() {
  const { leagueId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch NFL state to get current week
  const { data: nflState, isLoading: isLoadingState } = useQuery({
    queryKey: ['nfl-state'],
    queryFn: getSleeperNFLState
  });

  const { data: league, isLoading } = useQuery({
    queryKey: ['league', leagueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leagues')
        .select('*')
        .eq('league_id', leagueId)
        .single();

      if (error) throw error;

      // Fetch users and rosters from Sleeper API
      const usersResponse = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`);
      const users = await usersResponse.json();

      const rostersResponse = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`);
      const rosters = await rostersResponse.json();

      // Combine league data with users and rosters
      return {
        ...data,
        teams: rosters.map((roster: any) => {
          const user = users.find((u: any) => u.user_id === roster.owner_id);
          return {
            roster_id: roster.roster_id,
            owner_name: user?.display_name || "Unknown Owner",
            team_name: user?.metadata?.team_name || user?.display_name || "Unnamed Team",
            avatar: user?.avatar,
            wins: roster.settings?.wins || 0,
            losses: roster.settings?.losses || 0,
            ties: roster.settings?.ties || 0,
            fpts: roster.settings?.fpts || 0,
            fpts_decimal: roster.settings?.fpts_decimal || 0,
            fpts_against: roster.settings?.fpts_against || 0,
            fpts_against_decimal: roster.settings?.fpts_against_decimal || 0,
          };
        }).sort((a: any, b: any) => (b.wins - a.wins) || (b.fpts - a.fpts))
      } as League;
    },
  });

  if (isLoading || isLoadingState) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-mint">Loading league...</div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-mint">League not found</div>
      </div>
    );
  }

  const filteredTeams = league.teams?.filter(team => 
    team.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.owner_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentWeek = nflState?.week || 'Unknown';
  const seasonPhase = nflState?.season_type || 'regular';
  const weekDisplay = `${seasonPhase === 'regular' ? 'Week' : seasonPhase} ${currentWeek}`;

  return (
    <div className="space-y-8">
      {/* League Header */}
      <div className="bg-forest-light/30 border border-mint/10 backdrop-blur-sm rounded-lg p-6">
        <div className="flex items-center gap-4 mb-2">
          <Trophy className="h-8 w-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-mint">{league.name}</h1>
        </div>
        <div className="text-white/60 text-start">
          Season {league.season} • {league.total_rosters} Teams
        </div>
      </div>

      {/* League Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-forest-light/30 border-mint/10 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-5 w-5 text-mint" />
            <h3 className="text-lg font-semibold text-mint">Teams</h3>
          </div>
          <div className="text-3xl font-bold text-white text-start">{league.total_rosters}</div>
        </Card>

        <Card className="bg-forest-light/30 border-mint/10 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-5 w-5 text-mint" />
            <h3 className="text-lg font-semibold text-mint">Playoff Teams</h3>
          </div>
          <div className="text-3xl font-bold text-white text-start">6</div>
        </Card>

        <Card className="bg-forest-light/30 border-mint/10 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <CalendarDays className="h-5 w-5 text-mint" />
            <h3 className="text-lg font-semibold text-mint">Current Week</h3>
          </div>
          <div className="text-3xl font-bold text-white text-start">{weekDisplay}</div>
        </Card>
      </div>

      {/* Current Matchups */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-mint">Current Matchups</h2>
        <div className="grid grid-cols-1 gap-4">
          {/* Placeholder for matchups */}
          <div className="text-white/60">No current matchups</div>
        </div>
      </div>

      {/* League Standings */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-mint">League Standings</h2>
        
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex-1 relative">
            <Input 
              placeholder="Search teams or owners..." 
              className="bg-forest-light/30 border-mint/10 text-white pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="h-4 w-4 text-mint/50 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <Button
            variant="outline"
            className="border-mint/10 text-mint hover:bg-mint/10"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="bg-forest-light/30 border border-mint/10 backdrop-blur-sm rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-mint/10">
                <th className="text-left p-4 text-mint/60">Team</th>
                <th className="text-left p-4 text-mint/60">Owner</th>
                <th className="text-left p-4 text-mint/60">Record</th>
                <th className="text-right p-4 text-mint/60">Points For</th>
                <th className="text-right p-4 text-mint/60">Points Against</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams?.map((team) => (
                <tr key={team.roster_id} className="border-b border-mint/10">
                  <td className="p-4 text-white text-left">{team.team_name}</td>
                  <td className="p-4 text-white/60 text-left">{team.owner_name}</td>
                  <td className="p-4 text-white text-left">{`${team.wins}-${team.losses}${team.ties ? `-${team.ties}` : ''}`}</td>
                  <td className="p-4 text-white text-right">
                    {team.fpts.toFixed(2)}
                  </td>
                  <td className="p-4 text-white text-right">
                    {team.fpts_against.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}