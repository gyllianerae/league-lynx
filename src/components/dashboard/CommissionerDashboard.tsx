import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight, Star, MoreVertical } from "lucide-react";
import { getAvatarUrl } from "@/utils/sleeper";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface ManagedTeam {
  league_id: string;
  team_name: string;
  league_name: string;
  platform: string;
  rank?: number;
  wins?: number;
  losses?: number;
  ties?: number;
  upcoming_matchup?: string;
  starters?: string[];
  record?: string;
  team_status?: 'active' | 'open' | 'orphaned';
}

export const CommissionerDashboard = () => {
  const [selectedTeam, setSelectedTeam] = useState<ManagedTeam | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isStartersExpanded, setIsStartersExpanded] = useState(false);
  const queryClient = useQueryClient();

  // First, get the user's Sleeper username from their profile
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) throw new Error('No user session found');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Then fetch Sleeper user data and leagues
  const { data: managedTeams, isLoading: isTeamsLoading } = useQuery({
    queryKey: ['managed-teams', profile?.sleeper_username],
    queryFn: async () => {
      if (!profile?.sleeper_username) {
        throw new Error('No Sleeper username found');
      }

      // Get Sleeper user data
      const userResponse = await fetch(`https://api.sleeper.app/v1/user/${profile.sleeper_username}`);
      if (!userResponse.ok) throw new Error('Failed to fetch Sleeper user');
      const userData = await userResponse.json();

      // Get user's leagues
      const leaguesResponse = await fetch(`https://api.sleeper.app/v1/user/${userData.user_id}/leagues/nfl/2024`);
      if (!leaguesResponse.ok) throw new Error('Failed to fetch leagues');
      const leagues = await leaguesResponse.json();

      // For each league, fetch rosters and users to get team names
      const teams: ManagedTeam[] = [];
      
      await Promise.all(leagues.map(async (league: any) => {
        const [rostersResponse, usersResponse] = await Promise.all([
          fetch(`https://api.sleeper.app/v1/league/${league.league_id}/rosters`),
          fetch(`https://api.sleeper.app/v1/league/${league.league_id}/users`)
        ]);
        
        if (!rostersResponse.ok || !usersResponse.ok) return;
        
        const [rosters, users] = await Promise.all([
          rostersResponse.json(),
          usersResponse.json()
        ]);
        
        const userRoster = rosters.find((roster: any) => roster.owner_id === userData.user_id);
        
        if (userRoster) {
          // Find the user data to get the team name
          const rosterUser = users.find((user: any) => user.user_id === userRoster.owner_id);
          const teamName = rosterUser?.metadata?.team_name || rosterUser?.display_name || `Team ${userRoster.roster_id}`;
          
          teams.push({
            league_id: league.league_id,
            team_name: teamName,
            league_name: league.name,
            platform: 'Sleeper',
            rank: userRoster.settings?.rank,
            wins: userRoster.settings?.wins || 0,
            losses: userRoster.settings?.losses || 0,
            ties: userRoster.settings?.ties || 0,
            starters: userRoster.starters,
            record: `${userRoster.settings?.wins || 0}-${userRoster.settings?.losses || 0}${userRoster.settings?.ties ? `-${userRoster.settings?.ties}` : ''}`,
            team_status: userRoster.settings?.team_status || 'active'
          });
        }
      }));

      return teams;
    },
    enabled: !!profile?.sleeper_username
  });

  // Add mutation for updating team status
  const updateTeamStatus = useMutation({
    mutationFn: async ({ leagueId, teamName, status }: { leagueId: string, teamName: string, status: 'active' | 'open' | 'orphaned' }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) throw new Error('No user session found');

      const { error } = await supabase
        .from('managed_teams')
        .upsert({
          commissioner_id: session.user.id,
          league_id: leagueId,
          team_name: teamName,
          platform: 'Sleeper',
          team_status: status
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managed-teams'] });
      toast({
        title: "Team status updated",
        description: "The team's status has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating team status",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  if (isProfileLoading || isTeamsLoading) {
    return (
      <Card className="bg-forest-light/30 border-mint/10">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <Star className="h-12 w-12 text-mint/40 mb-4" />
            <h3 className="text-xl font-semibold text-mint mb-2">Loading Teams</h3>
            <p className="text-white/60">
              Fetching your managed teams...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!managedTeams || managedTeams.length === 0) {
    return (
      <Card className="bg-forest-light/30 border-mint/10">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <Star className="h-12 w-12 text-mint/40 mb-4" />
            <h3 className="text-xl font-semibold text-mint mb-2">No Teams Found</h3>
            <p className="text-white/60">
              You haven't added any teams to manage yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-forest-light/30 border-mint/10">
        <CardContent className="p-4">
          <ScrollArea className="h-[400px] w-full">
            <Table>
              <TableHeader>
                <TableRow className="border-none">
                  <TableHead className="text-[#F1F1F1] font-bold">Team Name</TableHead>
                  <TableHead className="text-[#F1F1F1] font-bold">League Name</TableHead>
                  <TableHead className="text-[#F1F1F1] font-bold">Platform</TableHead>
                  <TableHead className="text-[#F1F1F1] font-bold">Record</TableHead>
                  <TableHead className="text-[#F1F1F1] font-bold">Status</TableHead>
                  <TableHead className="text-[#F1F1F1] font-bold w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managedTeams?.map((team) => (
                  <TableRow 
                    key={`${team.league_id}-${team.team_name}`}
                    className="border-none hover:bg-forest-light/50 transition-colors"
                  >
                    <TableCell 
                      className="text-[#F1F1F1] cursor-pointer"
                      onClick={() => {
                        setSelectedTeam(team);
                        setIsStatsOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={getAvatarUrl(team.league_id)} alt={team.team_name} />
                          <AvatarFallback className="bg-forest text-mint text-xs">
                            {team.team_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{team.team_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#F1F1F1]">{team.league_name}</TableCell>
                    <TableCell className="text-[#F1F1F1]">{team.platform}</TableCell>
                    <TableCell className="text-[#F1F1F1]">{team.record}</TableCell>
                    <TableCell className="text-[#F1F1F1]">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        team.team_status === 'open' ? 'bg-yellow-500/20 text-yellow-300' :
                        team.team_status === 'orphaned' ? 'bg-red-500/20 text-red-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {team.team_status || 'Active'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4 text-mint" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-forest-light border-mint/10">
                          <DropdownMenuItem
                            className="text-[#F1F1F1] hover:bg-forest-light/50 cursor-pointer"
                            onClick={() => updateTeamStatus.mutate({
                              leagueId: team.league_id,
                              teamName: team.team_name,
                              status: 'active'
                            })}
                          >
                            Mark as Active
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-[#F1F1F1] hover:bg-forest-light/50 cursor-pointer"
                            onClick={() => updateTeamStatus.mutate({
                              leagueId: team.league_id,
                              teamName: team.team_name,
                              status: 'open'
                            })}
                          >
                            Mark as Open
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-[#F1F1F1] hover:bg-forest-light/50 cursor-pointer"
                            onClick={() => updateTeamStatus.mutate({
                              leagueId: team.league_id,
                              teamName: team.team_name,
                              status: 'orphaned'
                            })}
                          >
                            Mark as Orphaned
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isStatsOpen} onOpenChange={setIsStatsOpen}>
        <DialogContent className="bg-forest-light/95 border-mint/10 text-white max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-mint text-xl">Team Details</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] w-full pr-4">
            {selectedTeam && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={getAvatarUrl(selectedTeam.league_id)} alt={selectedTeam.team_name} />
                    <AvatarFallback className="bg-forest text-mint">
                      {selectedTeam.team_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-mint">{selectedTeam.team_name}</h3>
                    <p className="text-white/60">{selectedTeam.league_name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-white/60">Platform</p>
                    <p className="text-white">{selectedTeam.platform}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-white/60">Rank</p>
                    <p className="text-white">{selectedTeam.rank || '-'}</p>
                  </div>
                </div>

                <div className="pt-4">
                  <h4 className="text-lg font-semibold text-mint mb-2">Record</h4>
                  <div className="grid grid-cols-3 gap-4 bg-forest-light/30 p-4 rounded-md">
                    <div>
                      <p className="text-white/60">Wins</p>
                      <p className="text-white text-lg">{selectedTeam.wins || 0}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Losses</p>
                      <p className="text-white text-lg">{selectedTeam.losses || 0}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Ties</p>
                      <p className="text-white text-lg">{selectedTeam.ties || 0}</p>
                    </div>
                  </div>
                </div>

                {selectedTeam.starters && selectedTeam.starters.length > 0 && (
                  <div className="pt-4">
                    <Collapsible
                      open={isStartersExpanded}
                      onOpenChange={setIsStartersExpanded}
                      className="w-full"
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="flex w-full items-center justify-between p-4 hover:bg-forest-light/30"
                        >
                          <span className="text-lg font-semibold text-mint">Starting Lineup</span>
                          <ChevronRight
                            className={`h-4 w-4 text-mint transition-transform ${
                              isStartersExpanded ? "rotate-90" : ""
                            }`}
                          />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="bg-forest-light/30 p-4 rounded-md mt-2">
                        <p className="text-white whitespace-pre-line">
                          {selectedTeam.starters.join('\n')}
                        </p>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
