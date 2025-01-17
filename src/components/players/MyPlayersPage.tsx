import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PlayersList } from "./PlayersList";
import { PlayerDetails } from "./PlayerDetails";
import { SleeperPlayer } from "@/types/sleeper/player";
import { useLeagues } from "@/hooks/useLeagues";
import { Filter, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export const MyPlayersPage = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<SleeperPlayer | null>(null);
  const [viewMode, setViewMode] = useState<"leagues" | "teams">("leagues");
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const { leagues } = useLeagues();

  const { data: myPlayers, isLoading } = useQuery({
    queryKey: ['my-players', leagues?.map(l => l.league_id), viewMode, selectedLeague],
    queryFn: async () => {
      if (!leagues?.length) return [];
      
      // Get all rosters for user's leagues
      const playerIds = new Set<string>();
      
      try {
        const leaguesToProcess = selectedLeague 
          ? leagues.filter(l => l.league_id === selectedLeague)
          : leagues;

        await Promise.all(leaguesToProcess.map(async (league) => {
          try {
            // Fetch rosters for each league
            const rostersResponse = await fetch(`https://api.sleeper.app/v1/league/${league.league_id}/rosters`);
            if (!rostersResponse.ok) {
              throw new Error(`Failed to fetch rosters for league ${league.league_id}`);
            }
            const rosters = await rostersResponse.json();
            
            // Fetch users to match roster with username
            const usersResponse = await fetch(`https://api.sleeper.app/v1/league/${league.league_id}/users`);
            if (!usersResponse.ok) {
              throw new Error(`Failed to fetch users for league ${league.league_id}`);
            }
            const users = await usersResponse.json();
            
            // Find user's roster
            const userRoster = rosters.find((roster: any) => {
              const rosterUser = users.find((user: any) => user.user_id === roster.owner_id);
              return rosterUser?.username === users.find((u: any) => u.user_id === league.platform_user_id)?.username;
            });
            
            // Add all players from the roster
            if (userRoster?.players) {
              userRoster.players.forEach((playerId: string) => playerIds.add(playerId));
            }
          } catch (error) {
            console.error(`Error fetching roster for league ${league.league_id}:`, error);
            toast.error(`Error fetching roster for league ${league.name}`);
          }
        }));

        // Fetch player details from Supabase
        if (playerIds.size === 0) return [];
        
        const { data: players, error } = await supabase
          .from('players')
          .select('*')
          .in('player_id', Array.from(playerIds));

        if (error) {
          console.error('Error fetching players:', error);
          toast.error('Error fetching player details');
          return [];
        }

        return players;
      } catch (error) {
        console.error('Error in player fetch process:', error);
        toast.error('Failed to fetch players');
        return [];
      }
    },
    enabled: !!leagues?.length,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-sky-900 dark:text-mint">My Players</h2>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-gray-100 dark:bg-forest-light/30 hover:bg-forest-light/40 hover:bg-gray-200 text-sky-900 dark:text-mint dark:border-mint/20"
              >
                <Filter className="h-4 w-4 mr-2" />
                Leagues
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-100 dark:bg-forest-light/95 dark:border-mint/20 h-96 overflow-y-auto">
              <DropdownMenuItem 
                className="bg-gray-200 text-sky-900 dark:text-white dark:hover:text-mint dark:hover:bg-forest-light/80"
                onClick={() => setSelectedLeague(null)}
              >
                All Leagues
              </DropdownMenuItem>
              {leagues?.map((league) => (
                <DropdownMenuItem
                  key={league.league_id}
                  className="hover:bg-gray-200 text-sky-900 dark:text-white hover:text-sky-900 hover:cursor-pointer dark:hover:text-mint dark:hover:bg-forest-light/80"
                  onClick={() => setSelectedLeague(league.league_id)}
                >
                  {league.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <PlayersList
        players={myPlayers || []}
        onPlayerClick={(player) => setSelectedPlayer(player)}
        isLoading={isLoading}
        viewMode={viewMode}
      />

      {selectedPlayer && (
        <PlayerDetails
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
};