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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronDown, Star } from "lucide-react";
import { getAvatarUrl } from "@/utils/sleeper";
import { toast } from "sonner";

interface LeagueOpening {
  id: number;
  team_name: string;
  league_name: string;
  league_id: string;
  platform: string;
  team_status: 'active' | 'open' | 'orphaned';
  league_type: string;
  league_fee?: number;
  comments?: string;
  rank?: number;
  wins?: number;
  losses?: number;
  ties?: number;
  upcoming_matchup?: string;
  starters?: string;
  record?: string;
}

export const CommissionerDashboard = () => {
  const queryClient = useQueryClient();

  const { data: leagueOpenings, isLoading } = useQuery({
    queryKey: ['league-openings'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) throw new Error('No user session found');

      console.log('Fetching league openings for user ID:', session.user.id);

      const { data, error } = await supabase
        .from('league_openings')
        .select('*')
        .eq('commissioner_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching league openings:', error);
        toast.error('Failed to fetch league openings');
        throw error;
      }

      console.log('League Openings:', data);
      return data as LeagueOpening[];
    }
  });

  const updateTeamStatusMutation = useMutation({
    mutationFn: async ({ teamId, newStatus }: { teamId: number; newStatus: 'active' | 'open' | 'orphaned' }) => {
      const { error } = await supabase
        .from('league_openings')
        .update({ team_status: newStatus })
        .eq('id', teamId);

      if (error) throw error;
      return { teamId, newStatus };
    },
    onMutate: async ({ teamId, newStatus }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['league-openings'] });

      // Snapshot the previous value
      const previousLeagueOpenings = queryClient.getQueryData(['league-openings']);

      // Optimistically update to the new value
      queryClient.setQueryData(['league-openings'], (old: LeagueOpening[] | undefined) => {
        if (!old) return [];
        return old.map(team => 
          team.id === teamId 
            ? { ...team, team_status: newStatus }
            : team
        );
      });

      // Return a context object with the snapshotted value
      return { previousLeagueOpenings };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousLeagueOpenings) {
        queryClient.setQueryData(['league-openings'], context.previousLeagueOpenings);
      }
      toast.error('Failed to update team status');
      console.error('Error updating team status:', err);
    },
    onSuccess: (data) => {
      toast.success('Team status updated successfully');
    },
    onSettled: () => {
      // Always refetch after error or success to ensure server state
      queryClient.invalidateQueries({ queryKey: ['league-openings'] });
    },
  });

  const updateTeamStatus = (teamId: number, newStatus: 'active' | 'open' | 'orphaned') => {
    updateTeamStatusMutation.mutate({ teamId, newStatus });
  };

  if (isLoading) {
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

  if (!leagueOpenings || leagueOpenings.length === 0) {
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
    <Card className="bg-forest-light/30 border-mint/10">
      <CardContent className="p-4">
        <ScrollArea className="h-[400px] w-full">
          <Table>
            <TableHeader>
              <TableRow className="border-none">
                <TableHead className="text-[#F1F1F1] font-bold">Team Name</TableHead>
                <TableHead className="text-[#F1F1F1] font-bold">League Name</TableHead>
                <TableHead className="text-[#F1F1F1] font-bold">Platform</TableHead>
                <TableHead className="text-[#F1F1F1] font-bold">Status</TableHead>
                <TableHead className="text-[#F1F1F1] font-bold">League Type</TableHead>
                <TableHead className="text-[#F1F1F1] font-bold text-right">League Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leagueOpenings.map((team) => (
                <TableRow 
                  key={team.id}
                  className="border-none hover:bg-forest-light/50 transition-colors"
                >
                  <TableCell className="text-[#F1F1F1]">
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
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          className={`
                            ${team.team_status === 'active' ? 'bg-green-500/20 text-green-400' : 
                              team.team_status === 'open' ? 'bg-blue-500/20 text-blue-400' : 
                              'bg-red-500/20 text-red-400'}
                            border-none hover:bg-forest-light/50
                          `}
                        >
                          {team.team_status || 'Open'}
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-forest-light/90 backdrop-blur-md border-mint/10">
                        <DropdownMenuItem
                          className="text-green-400 hover:bg-forest-light/50 cursor-pointer"
                          onClick={() => updateTeamStatus(team.id, 'active')}
                        >
                          Active
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-blue-400 hover:bg-forest-light/50 cursor-pointer"
                          onClick={() => updateTeamStatus(team.id, 'open')}
                        >
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-400 hover:bg-forest-light/50 cursor-pointer"
                          onClick={() => updateTeamStatus(team.id, 'orphaned')}
                        >
                          Orphaned
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-[#F1F1F1]">{team.league_type}</TableCell>
                  <TableCell className="text-[#F1F1F1] text-right">
                    {team.league_fee ? `$${team.league_fee}` : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );

};
