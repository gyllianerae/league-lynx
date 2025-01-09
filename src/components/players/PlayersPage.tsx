import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PlayersList } from "./PlayersList";
import { PlayerDetails } from "./PlayerDetails";
import { PlayerFilters } from "./PlayerFilters";
import { SleeperPlayer } from "@/types/sleeper/player";
import { useLeagues } from "@/hooks/useLeagues";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const PlayersPage = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<SleeperPlayer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { leagues, isLoading: isLeaguesLoading } = useLeagues();
  const queryClient = useQueryClient();

  // Use React Query for persisting selected league and filters
  const { data: selectedLeagueId } = useQuery({
    queryKey: ['selectedLeague'],
    queryFn: () => "all",
    staleTime: Infinity,
  });

  const { data: positionFilter } = useQuery({
    queryKey: ['positionFilter'],
    queryFn: () => "All Positions",
    staleTime: Infinity,
  });

  const { data: statusFilter } = useQuery({
    queryKey: ['statusFilter'],
    queryFn: () => "All Status",
    staleTime: Infinity,
  });

  const setSelectedLeagueId = (value: string) => {
    queryClient.setQueryData(['selectedLeague'], value);
  };

  const setPositionFilter = (value: string) => {
    queryClient.setQueryData(['positionFilter'], value);
  };

  const setStatusFilter = (value: string) => {
    queryClient.setQueryData(['statusFilter'], value);
  };

  const { data: players, isLoading } = useQuery({
    queryKey: ['players', searchQuery, positionFilter, statusFilter, selectedLeagueId],
    queryFn: async () => {
      let query = supabase
        .from('players')
        .select('*')
        .eq('active', true);

      if (searchQuery) {
        query = query.ilike('full_name', `%${searchQuery}%`);
      }

      if (positionFilter !== "All Positions") {
        query = query.eq('position', positionFilter);
      }

      if (statusFilter !== "All Status") {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching players:', error);
        return [];
      }

      // If a specific league is selected, filter players based on league roster
      if (selectedLeagueId !== "all" && data) {
        try {
          const response = await fetch(`https://api.sleeper.app/v1/league/${selectedLeagueId}/rosters`);
          const rosters = await response.json();
          
          // Get all player IDs from all rosters
          const leaguePlayers = rosters.reduce((acc: string[], roster: any) => {
            return [...acc, ...(roster.players || [])];
          }, []);

          // Filter players that are in the league
          return data.filter(player => leaguePlayers.includes(player.player_id));
        } catch (error) {
          console.error('Error fetching league rosters:', error);
          return data;
        }
      }

      return data;
    }
  });

  const filteredPlayers = players || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-mint">Players</h2>
        <Select
          value={selectedLeagueId}
          onValueChange={setSelectedLeagueId}
        >
          <SelectTrigger className="w-[200px] bg-forest-light/50 border-mint/10 text-mint">
            <SelectValue placeholder="All Leagues" />
          </SelectTrigger>
          <SelectContent className="bg-forest-light/100 text-mint border border-mint/10 rounded-md">
            <SelectItem value="all" className="hover:bg-mint/10 focus:bg-mint/20 text-mint cursor-pointer">All Leagues</SelectItem>
            {leagues?.map((league) => (
              <SelectItem key={league.league_id} value={league.league_id} className="hover:bg-mint/10 focus:bg-mint/20 text-mint cursor-pointer">
                {league.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <PlayerFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        positionFilter={positionFilter || "All Positions"}
        onPositionChange={setPositionFilter}
        statusFilter={statusFilter || "All Status"}
        onStatusChange={setStatusFilter}
      />

      <PlayersList
        players={filteredPlayers}
        onPlayerClick={(player) => setSelectedPlayer(player)}
        isLoading={isLoading || isLeaguesLoading}
      />

      <PlayerDetails
        player={selectedPlayer}
        isOpen={!!selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
      />
    </div>
  );
};