import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { MarketplaceListing } from "@/types/database/marketplace-league";

interface EditLeagueFormData {
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

interface EditLeagueDialogProps {
  league: MarketplaceListing;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditLeagueDialog = ({ league, open, onOpenChange }: EditLeagueDialogProps) => {
  const { toast } = useToast();
  const form = useForm<EditLeagueFormData>({
    defaultValues: {
      teamName: league.title,
      keyPlayers: league.description || "",
      leagueName: league.title,
      leagueId: "",
      leagueFee: league.entry_fee || 0,
      platform: "",
      comments: "",
      teamStatus: 'open',
      wins: 0,
      losses: 0,
      ties: 0,
    },
  });
  const queryClient = useQueryClient();

  const updateLeagueMutation = useMutation({
    mutationFn: async (data: EditLeagueFormData) => {
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
        .eq('id', league.id)
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
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['league-openings'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update league opening. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating league opening:', error);
    },
  });

  const onSubmit = (data: EditLeagueFormData) => {
    updateLeagueMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark:bg-forest-light dark:border-mint/10">
        <DialogHeader>
          <DialogTitle className="dark:text-mint">Edit League Opening</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[80vh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium dark:text-mint/80">Team Information</h3>
                <FormField
                  control={form.control}
                  name="teamName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-mint">Team Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="dark:bg-forest dark:border-mint/20 dark:text-white" />
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
                      <FormLabel className="dark:text-mint">Team Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="dark:bg-forest dark:border-mint/20 dark:text-white">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="dark:bg-forest-light dark:border-mint/10">
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="orphaned">Orphaned</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
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
                        <FormLabel className="dark:text-mint">Wins</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" className="dark:bg-forest dark:border-mint/20 dark:text-white" />
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
                        <FormLabel className="dark:text-mint">Losses</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" className="dark:bg-forest dark:border-mint/20 dark:text-white" />
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
                        <FormLabel className="dark:text-mint">Ties</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" className="dark:bg-forest dark:border-mint/20 dark:text-white" />
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
                      <FormLabel className="dark:text-mint">Current Rank</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" className="dark:bg-forest dark:border-mint/20 dark:text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium dark:text-mint/80">League Details</h3>
                <FormField
                  control={form.control}
                  name="leagueName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-mint">League Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="dark:bg-forest dark:border-mint/20 dark:text-white" />
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
                      <FormLabel className="text-mint">League ID</FormLabel>
                      <FormControl>
                        <Input {...field} className="dark:bg-forest dark:border-mint/20 dark:text-white" />
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
                        <FormLabel className="dark:text-mint">League Fee ($)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" className="dark:bg-forest dark:border-mint/20 dark:text-white" />
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
                        <FormLabel className="dark:text-mint">League Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="dark:bg-forest dark:border-mint/20 dark:text-white">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="dark:bg-forest-light dark:border-mint/10">
                            <SelectItem value="Dynasty">Dynasty</SelectItem>
                            <SelectItem value="Keeper">Keeper</SelectItem>
                            <SelectItem value="C2C">C2C</SelectItem>
                            <SelectItem value="Redraft">Redraft</SelectItem>
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
                      <FormLabel className="dark:text-mint">Platform</FormLabel>
                      <FormControl>
                        <Input {...field} className="dark:bg-forest dark:border-mint/20 dark:text-white" placeholder="e.g., Sleeper, ESPN" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium dark:text-mint/80">Team Details</h3>
                <FormField
                  control={form.control}
                  name="keyPlayers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-mint">Key Players</FormLabel>
                      <FormControl>
                        <Input {...field} className="dark:bg-forest dark:border-mint/20 dark:text-white" placeholder="e.g., Justin Jefferson, Trevor Lawrence" />
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
                      <FormLabel className="dark:text-mint">Current Starters</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="dark:bg-forest dark:border-mint/20 dark:text-white" placeholder="List your current starting lineup" />
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
                      <FormLabel className="dark:text-mint">Upcoming Matchup</FormLabel>
                      <FormControl>
                        <Input {...field} className="dark:bg-forest dark:border-mint/20 dark:text-white" placeholder="e.g., vs Team XYZ Week 5" />
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
                    <FormLabel className="dark:text-mint">Additional Comments</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="dark:bg-forest dark:border-mint/20 dark:text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full dark:bg-mint dark:hover:bg-mint/90 dark:text-forest">
                Update League Opening
              </Button>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};