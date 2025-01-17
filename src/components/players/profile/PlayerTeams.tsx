import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Users } from "lucide-react";
import { useState } from "react";
import { League } from "@/types/database/league";

interface PlayerTeam {
  league_name: string;
  team_name: string;
  roster_id: number;
}

export function PlayerTeams({ playerId }: { playerId: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const { data: playerTeams, isLoading } = useQuery({
    queryKey: ['player-teams', playerId],
    queryFn: async () => {
      // First, get all leagues from the database
      const { data: leagues } = await supabase
        .from("leagues")
        .select("*");

      if (!leagues) return [];

      const teamsWithPlayer: PlayerTeam[] = [];

      // For each league, check if the player is on any roster
      await Promise.all(
        leagues.map(async (league: League) => {
          const response = await fetch(
            `https://api.sleeper.app/v1/league/${league.league_id}/rosters`
          );
          const rosters = await response.json();

          // Get league users to match with rosters
          const usersResponse = await fetch(
            `https://api.sleeper.app/v1/league/${league.league_id}/users`
          );
          const users = await usersResponse.json();

          rosters.forEach((roster: any) => {
            if (roster.players?.includes(playerId)) {
              // Find the user who owns this roster
              const user = users.find((u: any) => u.user_id === roster.owner_id);
              const teamName = roster.settings?.team_name || 
                             user?.metadata?.team_name ||
                             user?.display_name ||
                             `Team #${roster.roster_id}`;
              
              teamsWithPlayer.push({
                league_name: league.name,
                team_name: teamName,
                roster_id: roster.roster_id,
              });
            }
          });
        })
      );

      return teamsWithPlayer;
    },
  });

  const filteredTeams = playerTeams?.filter((team) => {
    const matchesSearch = 
      team.league_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.team_name.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === "all") return matchesSearch;
    if (filterType === "my-teams") return matchesSearch && team.team_name !== "Unnamed Team";
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <Card className="bg-forest-light/50 backdrop-blur-xl p-6 border border-mint/10 h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-mint/10 rounded w-1/3" />
          <div className="h-12 bg-mint/10 rounded" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-mint/10 rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-100 dark:bg-forest-light/50 backdrop-blur-xl p-6 border dark:border-mint/10 dark:hover:border-mint/20 transition-all duration-300 shadow-lg h-full">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-sky-900 dark:text-mint flex items-center gap-2">
            <Users className="h-5 w-5" />
            Teams & Leagues
          </h3>
          <Select
            value={filterType}
            onValueChange={setFilterType}
          >
            <SelectTrigger className="w-[140px] bg-gray-100 text-sky-900 dark:bg-forest-light/50 dark:border-mint/10 dark:text-mint">
              <SelectValue placeholder="Filter teams" />
            </SelectTrigger>
            <SelectContent className="bg-gray-100 text-sky-900 dark:bg-forest-light/50 dark:border-mint/10 dark:text-mint">
              <SelectItem value="all" className="hover:bg-gray-200 hover:cursor-pointer">All Teams</SelectItem>
              <SelectItem value="my-teams" className="hover:bg-gray-200 hover:cursor-pointer">My Teams</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-900 dark:text-mint/40 h-4 w-4" />
          <Input
            placeholder="Search teams or leagues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-100 text-sky-900 dark:bg-forest-light/50 dark:border-mint/10 dark:text-mint"
          />
        </div>

        {filteredTeams?.length === 0 ? (
          <div className="text-center py-8 text-sky-900 dark:text-white/60">
            No teams found with this player
          </div>
        ) : (
          <div className="rounded-md border border-mint/10">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-forest-light/30 border-mint/10">
                  <TableHead className="text-mint">Team Name</TableHead>
                  <TableHead className="text-mint">League</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeams?.map((team) => (
                  <TableRow 
                    key={`${team.league_name}-${team.roster_id}`}
                    className="hover:bg-forest-light/30 border-mint/10"
                  >
                    <TableCell className="text-white/90">{team.team_name}</TableCell>
                    <TableCell className="text-white/60">{team.league_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Card>
  );
}