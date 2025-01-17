import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthState } from "@/hooks/useAuthState";
import { useQueryClient, useMutation } from "@tanstack/react-query";

interface PostLeagueOpeningFormData {
  teamName: string;
  keyPlayers: string;
  leagueName: string;
  leagueId: string;
  leagueFee: number;
  leagueType: 'Dynasty' | 'Keeper' | 'C2C' | 'Redraft';
  platform: string;
  comments: string;
  teamStatus: 'active' | 'open' | 'orphaned';
  rank?: number;
  wins?: number;
  losses?: number;
  ties?: number;
  upcomingMatchup?: string;
  starters?: string;
  record?: string;
}

export const PostLeagueOpeningDialog = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthState();
  const form = useForm<PostLeagueOpeningFormData>({
    defaultValues: {
      teamStatus: 'open',
      wins: 0,
      losses: 0,
      ties: 0,
    }
  });
  const queryClient = useQueryClient();

  const createLeagueOpeningMutation = useMutation({
    mutationFn: async (data: PostLeagueOpeningFormData) => {
      // First create the league opening
      const { data: leagueOpening, error: leagueOpeningError } = await supabase
        .from('league_openings')
        .insert({
          commissioner_id: user?.id,
          team_name: data.teamName,
          key_players: data.keyPlayers,
          league_name: data.leagueName,
          league_id: data.leagueId,
          league_fee: data.leagueFee,
          league_type: data.leagueType,
          platform: data.platform,
          comments: data.comments,
          team_status: data.teamStatus,
          rank: data.rank,
          wins: data.wins,
          losses: data.losses,
          ties: data.ties,
          upcoming_matchup: data.upcomingMatchup,
          starters: data.starters,
          record: `${data.wins}-${data.losses}-${data.ties}`
        })
        .select()
        .single();

      if (leagueOpeningError) throw leagueOpeningError;

      return leagueOpening;
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "League opening has been posted.",
      });
      setOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['league-openings'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to post league opening. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating league opening:', error);
    },
  });

  const onSubmit = (data: PostLeagueOpeningFormData) => {
    createLeagueOpeningMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-sky-900 text-gray-50 dark:bg-mint  dark:hover:bg-mint/90 dark:text-forest">
          <Plus className="mr-2 h-4 w-4" /> Post Opening
        </Button>
      </DialogTrigger>
      <DialogContent className="dark:bg-forest-light dark:border-mint/10">
        <DialogHeader>
          <DialogTitle className="text-sky-900 dark:text-mint">Post New League Opening</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[80vh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-sky-900 dark:text-mint/80">Team Information</h3>
              <FormField
                control={form.control}
                name="teamName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sky-900 dark:text-mint">Team Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-50 text-sky-900 selection:bg-gray-200 dark:bg-forest dark:border-mint/20 dark:text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="teamStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sky-900 dark:text-mint">Team Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-50 text-sky-900 selection:bg-gray-200 dark:bg-forest dark:border-mint/20 dark:text-white">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-50 text-sky-900 dark:text-white dark:bg-forest-light dark:border-mint/10">
                        <SelectItem value="open" className="hover:bg-gray-100 dark:hover:bg-mint/10 cursor-pointer">Open</SelectItem>
                        <SelectItem value="orphaned" className="hover:bg-gray-100 dark:hover:bg-mint/10 cursor-pointer">Orphaned</SelectItem>
                        <SelectItem value="active" className="hover:bg-gray-100 dark:hover:bg-mint/10 cursor-pointer">Active</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="wins"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sky-900 dark:text-mint">Wins</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" className="bg-gray-50 text-sky-900 selection:bg-gray-200 dark:bg-forest dark:border-mint/20 dark:text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="losses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sky-900 dark:text-mint">Losses</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" className="bg-gray-50 text-sky-900 selection:bg-gray-200 dark:bg-forest dark:border-mint/20 dark:text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ties"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sky-900 dark:text-mint">Ties</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" className="bg-gray-50 text-sky-900 selection:bg-gray-200 dark:bg-forest dark:border-mint/20 dark:text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="rank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sky-900 dark:text-mint">Current Rank</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" className="bg-gray-50 text-sky-900 selection:bg-gray-200 dark:bg-forest dark:border-mint/20 dark:text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-sky-900 dark:text-mint/80">League Details</h3>
              <FormField
                control={form.control}
                name="leagueName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sky-900 dark:text-mint">League Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-50 text-sky-900 selection:bg-gray-200 dark:bg-forest dark:border-mint/20 dark:text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="leagueId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sky-900 dark:text-mint">League ID</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-50 text-sky-900 selection:bg-gray-200 dark:bg-forest dark:border-mint/20 dark:text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="leagueFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sky-900 dark:text-mint">League Fee ($)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" className="bg-gray-50 text-sky-900 selection:bg-gray-200 dark:bg-forest dark:border-mint/20 dark:text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="leagueType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sky-900 dark:text-mint">League Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-50 text-sky-900 selection:bg-gray-200 dark:bg-forest dark:border-mint/20 dark:text-white">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-100 text-sky-900 dark:text-mint dark:bg-forest-light dark:border-mint/10">
                          <SelectItem value="Dynasty" className="hover:bg-gray-200 dark:hover:bg-mint/10 cursor-pointer">Dynasty</SelectItem>
                          <SelectItem value="Keeper" className="hover:bg-gray-200 dark:hover:bg-mint/10 cursor-pointer">Keeper</SelectItem>
                          <SelectItem value="C2C" className="hover:bg-gray-200 dark:hover:bg-mint/10 cursor-pointer">C2C</SelectItem>
                          <SelectItem value="Redraft" className="hover:bg-gray-200 dark:hover:bg-mint/10 cursor-pointer">Redraft</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sky-900 dark:text-mint">Platform</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-50 text-sky-900 selection:bg-gray-200 dark:bg-forest dark:border-mint/20 dark:text-white" placeholder="e.g., Sleeper, ESPN" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-sky-900 dark:text-mint/80">Team Details</h3>
              <FormField
                control={form.control}
                name="keyPlayers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sky-900 dark:text-mint">Key Players</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-50 text-sky-900 selection:bg-gray-200 dark:bg-forest dark:border-mint/20 dark:text-white" placeholder="e.g., Justin Jefferson, Trevor Lawrence" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="starters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sky-900 dark:text-mint">Current Starters</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="bg-gray-50 text-sky-900 selection:bg-gray-200 dark:bg-forest dark:border-mint/20 dark:text-white" placeholder="List your current starting lineup" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="upcomingMatchup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sky-900 dark:text-mint">Upcoming Matchup</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-50 text-sky-900 selection:bg-gray-200 dark:bg-forest dark:border-mint/20 dark:text-white" placeholder="e.g., vs Team XYZ Week 5" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sky-900 dark:text-mint">Additional Comments</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="bg-gray-50 text-sky-900 selection:bg-gray-200 dark:bg-forest dark:border-mint/20 dark:text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-sky-900 text-gray-50 dark:bg-mint dark:hover:bg-mint/90 dark:text-forest">
              Post League Opening
            </Button>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
