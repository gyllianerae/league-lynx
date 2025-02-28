import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthState } from "@/hooks/useAuthState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PostLeagueOpeningDialog } from "@/components/community/PostLeagueOpeningDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trophy, Users, CalendarDays, Shield, MoreVertical, ExternalLink } from "lucide-react";
import { UserAvatar } from "@/components/auth/verification/UserAvatar";

type TeamStatus = 'open' | 'active' | 'orphaned';

export default function Community() {
  const [isCommissioner, setIsCommissioner] = useState(false);
  const { isAuthenticated, user } = useAuthState();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOpeningId, setSelectedOpeningId] = useState<number | null>(null);
  const [leagueTypeFilter, setLeagueTypeFilter] = useState("all");
  const [isInviteLinkDialogOpen, setIsInviteLinkDialogOpen] = useState(false);
  const [currentInviteLink, setCurrentInviteLink] = useState("");
  const [editingOpening, setEditingOpening] = useState<any | null>(null);

  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: leagueOpenings = [], isLoading } = useQuery({
    queryKey: ['league-openings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('league_openings')
        .select(`
          *,
          commissioner:profiles(
            id,
            username,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const deleteLeagueOpeningMutation = useMutation({
    mutationFn: async (openingId: number) => {
      const { error } = await supabase
        .from('league_openings')
        .delete()
        .eq('id', openingId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "League opening deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['league-openings'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete league opening",
        variant: "destructive",
      });
    },
  });

  const updateLeagueOpeningMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from('league_openings')
        .update({
          team_name: data.teamName,
          key_players: data.keyPlayers,
          league_name: data.leagueName,
          league_id: data.leagueId,
          league_fee: data.leagueFee,
          league_type: data.leagueType,
          platform: data.platform,
          comments: data.comments
        })
        .eq('id', editingOpening.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "League opening has been updated.",
      });
      setEditingOpening(null);
      queryClient.invalidateQueries({ queryKey: ['league-openings'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update league opening. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateInviteLink = (openingId: number) => {
    const link = `${window.location.origin}/join-league/${openingId}`;
    setCurrentInviteLink(link);
    setIsInviteLinkDialogOpen(true);
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(currentInviteLink);
      toast({
        title: "Success",
        description: "Invite link copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy invite link",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (openingId: number) => {
    setSelectedOpeningId(openingId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedOpeningId) {
      deleteLeagueOpeningMutation.mutate(selectedOpeningId);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleRequestToJoin = (leagueId: string) => {
    window.open(`https://sleeper.app/leagues/${leagueId}`, '_blank');
  };

  const handleEditOpening = (opening: any) => {
    setEditingOpening(opening);
  };

  const handleUpdateOpening = (data: any) => {
    updateLeagueOpeningMutation.mutate(data);
  };

  const filteredOpenings = leagueTypeFilter === "all" 
    ? leagueOpenings 
    : leagueOpenings.filter(opening => opening.league_type === leagueTypeFilter);

  const showPostButton = isAuthenticated && profile?.role === 'commissioner';

  const isUserCommissioner = profile?.role === 'commissioner';

  const updateTeamStatus = async (openingId: number, newStatus: TeamStatus) => {
    try {
      const { error } = await supabase
        .from('league_openings')
        .update({ team_status: newStatus })
        .eq('id', openingId);

      if (error) throw error;

      // Optimistically update the UI
      const updatedOpenings = filteredOpenings.map(opening => 
        opening.id === openingId ? { ...opening, team_status: newStatus } : opening
      );
      
      queryClient.setQueryData(['league-openings'], updatedOpenings);
      
      toast({
        title: "Success",
        description: "Team status updated successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update team status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gray-50 dark:bg-forest-light/30 border-mint/10 border rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-sky-900 dark:text-white">League Openings</h1>
          {showPostButton && <PostLeagueOpeningDialog />}
        </div>

        <div className="space-y-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Search leagues..."
              className="flex-1 rounded-md bg-gray-50 text-sky-900 dark:text-mint dark:bg-forest-light/30 selection:bg-gray-200 py-1 px-2 dark:border-mint/10 border shadow-sm dark:focus:border-blue-500 dark:focus:ring-blue-500"
            />
            <Select 
              value={leagueTypeFilter} 
              onValueChange={setLeagueTypeFilter}
            >
              <SelectTrigger className="w-[180px] bg-gray-50 text-sky-900 dark:bg-forest-light/30 dark:border-mint/10">
                <SelectValue placeholder="League Type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-50 text-sky-900 dark:bg-forest-light dark:border-mint/10">
                <SelectItem value="all" className="hover:bg-gray-100  dark:hover:bg-mint/10 hover:cursor-pointer">All Types</SelectItem>
                <SelectItem value="Dynasty" className="hover:bg-gray-100  dark:hover:bg-mint/10 hover:cursor-pointer">Dynasty</SelectItem>
                <SelectItem value="Keeper" className="hover:bg-gray-100  dark:hover:bg-mint/10 hover:cursor-pointer">Keeper</SelectItem>
                <SelectItem value="Redraft" className="hover:bg-gray-100  dark:hover:bg-mint/10 hover:cursor-pointer">Redraft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center text-gray-500 dark:text-mint/60">Loading league openings...</div>
          ) : filteredOpenings.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-mint/60">No league openings available.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOpenings.map((opening) => (
                <Card key={opening.id} className="bg-gray-50 dark:bg-forest-light/30 dark:border-mint/10 backdrop-blur-sm overflow-hidden">
                  <div className="h-48 w-full bg-gray-200 dark:bg-forest relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Shield className="w-20 h-20 text-sky-900 dark:text-mint/20" />
                    </div>
                    {isUserCommissioner && opening.commissioner_id === user?.id && (
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-sky-900 dark:text-white/60 dark:hover:text-white">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-gray-50 dark:bg-forest-light dark:border-mint/10">
                            <DropdownMenuItem 
                              className="text-sky-900 dark:text-mint hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleEditOpening(opening)}
                            >
                              Edit League
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-400 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleDelete(opening.id)}
                            >
                              Delete League
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-sky-900 dark:text-white mb-1 text-start">{opening.league_name}</h3>
                        <p className="text-sm text-sky-900 dark:text-mint/60">Team: {opening.team_name}</p>
                        <div className="bg-gray-100 dark:bg-mint/10 px-3 py-1 rounded-full w-1/2 mt-2">
                          <span className="text-gray-500 dark:text-mint text-sm">{opening.league_type}</span>
                        </div>
                      </div>
                    </div>

                    {opening.league_fee && (
                      <div className="flex items-center gap-2 text-sky-900 dark:text-white/60">
                        <Trophy className="h-4 w-4" />
                        <span>${opening.league_fee} League Fee</span>
                      </div>
                    )}
                    {opening.rank && (
                      <div className="flex items-center gap-2 dark:text-white/60">
                        <Users className="h-4 w-4" />
                        <span>Rank: {opening.rank}</span>
                      </div>
                    )}
                    {opening.record && (
                      <div className="flex items-center gap-2 text-white/60">
                        <CalendarDays className="h-4 w-4" />
                        <span>Record: {opening.record}</span>
                      </div>
                    )}

                    {isUserCommissioner && opening.commissioner_id === user?.id ? (
                      <div className="pt-4 space-y-2">
                        <div className="pt-4">
                          <Select 
                            value={opening.team_status || 'open'} 
                            onValueChange={(value: TeamStatus) => updateTeamStatus(opening.id, value)}
                          >
                            <SelectTrigger className="w-full text-sky-900 dark:text-mint dark:bg-forest-light/30 dark:border-mint/10">
                              <SelectValue placeholder="Team Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-50 text-sky-900 dark:text-mint dark:bg-forest-light dark:border-mint/10">
                              <SelectItem value="open" className="hover:bg-gray-200 cursor-pointer">Open</SelectItem>
                              <SelectItem value="active" className="hover:bg-gray-200 cursor-pointer">Active</SelectItem>
                              <SelectItem value="orphaned" className="hover:bg-gray-200 cursor-pointer">Orphaned</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          className="w-full bg-gray-300 text-sky-900 dark:bg-mint/20 dark:hover:bg-mint/30 dark:text-mint"
                          onClick={() => generateInviteLink(opening.id)}
                        >
                          Generate Invite Link
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full bg-sky-900 text-gray-50 dark:bg-mint dark:hover:bg-mint/90 dark:text-forest"
                        onClick={() => window.open(`https://${opening.platform}.com/leagues/${opening.league_id}`, '_blank')}
                      >
                        View on {opening.platform}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-50 dark:bg-forest-light dark:border-mint/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sky-900 dark:text-mint">Delete League Opening</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 dark:text-white/60">
              Are you sure you want to delete this league opening? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-50 dark:bg-forest-light dark:text-mint dark:hover:bg-forest-light/80">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-900 hover:bg-red-900/90 text-gray-50 border border-red-900/50"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isInviteLinkDialogOpen} onOpenChange={setIsInviteLinkDialogOpen}>
        <AlertDialogContent className="bg-gray-100 dark:bg-forest-light dark:border-mint/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sky-900 dark:text-mint">League Invite Link</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 dark:text-white/60 text-start">
              Share this link with players to invite them to your league:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 my-4">
            <Input 
              value={currentInviteLink}
              readOnly
              className="text-sky-900 dark:bg-forest dark:border-mint/20 dark:text-white"
            />
            <Button onClick={copyInviteLink} className="text-gray-50 bg-sky-900 dark:bg-mint dark:hover:bg-mint/90 dark:text-forest">
              Copy
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction className="text-sky-900 dark:bg-mint dark:hover:bg-mint/90 dark:text-forest">
              Done
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editingOpening && (
        <AlertDialog open={!!editingOpening} onOpenChange={(open) => !open && setEditingOpening(null)}>
          <AlertDialogContent className="bg-gray-100 dark:bg-forest-light dark:border-mint/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-sky-900 dark:text-mint">Edit League Opening</AlertDialogTitle>
            </AlertDialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                teamName: formData.get('teamName'),
                keyPlayers: formData.get('keyPlayers'),
                leagueName: formData.get('leagueName'),
                leagueId: formData.get('leagueId'),
                leagueFee: Number(formData.get('leagueFee')),
                leagueType: formData.get('leagueType'),
                platform: formData.get('platform'),
                comments: formData.get('comments'),
              };
              handleUpdateOpening(data);
            }} className="space-y-4">
              <div>
                <label className="text-sm text-sky-900 dark:text-mint">Team Name</label>
                <Input name="teamName" defaultValue={editingOpening.team_name} className="text-sky-900 dark:bg-forest dark:border-mint/20 dark:text-white" />
              </div>
              <div>
                <label className="text-sm text-sky-900 dark:text-mint">Key Players</label>
                <Input name="keyPlayers" defaultValue={editingOpening.key_players} className="text-sky-900 dark:bg-forest dark:border-mint/20 dark:text-white" />
              </div>
              <div>
                <label className="text-sm text-sky-900 dark:text-mint">League Name</label>
                <Input name="leagueName" defaultValue={editingOpening.league_name} className="text-sky-900 dark:bg-forest dark:border-mint/20 dark:text-white" />
              </div>
              <div>
                <label className="text-sm text-sky-900 dark:text-mint">League ID</label>
                <Input name="leagueId" defaultValue={editingOpening.league_id} className="text-sky-900 dark:bg-forest dark:border-mint/20 dark:text-white" />
              </div>
              <div>
                <label className="text-sm text-sky-900 dark:text-mint">League Fee</label>
                <Input name="leagueFee" type="number" defaultValue={editingOpening.league_fee} className="text-sky-900 dark:bg-forest dark:border-mint/20 dark:text-white" />
              </div>
              <div>
                <label className="text-sm text-sky-900 dark:text-mint">League Type</label>
                <Select name="leagueType" defaultValue={editingOpening.league_type}>
                  <SelectTrigger className="text-sky-900 dark:bg-forest dark:border-mint/20 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-50 text-sky-900 dark:text-mint dark:bg-forest-light dark:border-mint/10">
                    <SelectItem value="Dynasty" className="hover:bg-gray-100 dark:hover:bg-mint/10 cursor-pointer">Dynasty</SelectItem>
                    <SelectItem value="Keeper" className="hover:bg-gray-100 dark:hover:bg-mint/10 cursor-pointer">Keeper</SelectItem>
                    <SelectItem value="C2C" className="hover:bg-gray-100 dark:hover:bg-mint/10 cursor-pointer">C2C</SelectItem>
                    <SelectItem value="Redraft" className="hover:bg-gray-100 dark:hover:bg-mint/10 cursor-pointer">Redraft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-sky-900 dark:text-mint">Platform</label>
                <Input name="platform" defaultValue={editingOpening.platform} className="text-sky-900 dark:bg-forest dark:border-mint/20 dark:text-white" />
              </div>
              <div>
                <label className="text-sm text-sky-900 dark:text-mint">Comments</label>
                <Input name="comments" defaultValue={editingOpening.comments} className="text-sky-900 dark:bg-forest dark:border-mint/20 dark:text-white" />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-50 text-sky-900 dark:bg-forest-light dark:text-mint dark:hover:bg-forest-light/80">
                  Cancel
                </AlertDialogCancel>
                <Button type="submit" className="bg-sky-900 text-gray-50 dark:bg-mint dark:hover:bg-mint/90 dark:text-forest">
                  Update
                </Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
