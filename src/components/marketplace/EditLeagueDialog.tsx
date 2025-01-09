import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { MarketplaceListing } from "@/types/database/marketplace-league";

interface EditLeagueFormData {
  title: string;
  description: string;
  totalSpots: number;
  entryFee: number;
  prizePool: number;
  draftDate: string;
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
      title: league.title,
      description: league.description || "",
      totalSpots: league.total_spots,
      entryFee: league.entry_fee || 0,
      prizePool: league.prize_pool || 0,
      draftDate: league.draft_date ? new Date(league.draft_date).toISOString().slice(0, 16) : "",
    },
  });
  const queryClient = useQueryClient();

  const updateLeagueMutation = useMutation({
    mutationFn: async (data: EditLeagueFormData) => {
      const { data: result, error } = await supabase
        .from('marketplace_listings')
        .update({
          title: data.title,
          description: data.description,
          total_spots: data.totalSpots,
          entry_fee: data.entryFee,
          prize_pool: data.prizePool,
          draft_date: new Date(data.draftDate).toISOString(),
        })
        .eq('id', league.id)
        .select('*, commissioner:profiles(*)')
        .single();

      if (error) throw error;
      return result;
    },
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['marketplace-listings'] });

      // Snapshot the previous value
      const previousLeagues = queryClient.getQueryData(['marketplace-listings']);

      // Optimistically update the cache
      queryClient.setQueryData(['marketplace-listings'], (old: MarketplaceListing[] = []) => {
        return old.map(l => {
          if (l.id === league.id) {
            return {
              ...l,
              title: newData.title,
              description: newData.description,
              total_spots: newData.totalSpots,
              entry_fee: newData.entryFee,
              prize_pool: newData.prizePool,
              draft_date: new Date(newData.draftDate).toISOString(),
            };
          }
          return l;
        });
      });

      return { previousLeagues };
    },
    onError: (err, newData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(['marketplace-listings'], context?.previousLeagues);
      toast({
        title: "Error",
        description: "Failed to update league. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "League has been updated.",
      });
      onOpenChange(false);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache is in sync with server
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
    },
  });

  const onSubmit = (data: EditLeagueFormData) => {
    updateLeagueMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-forest-light border-mint/10">
        <DialogHeader>
          <DialogTitle className="text-mint">Edit League</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-mint">League Title</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-forest border-mint/20 text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-mint">Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="bg-forest border-mint/20 text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="totalSpots"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-mint">Total Spots</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" className="bg-forest border-mint/20 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="entryFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-mint">Entry Fee ($)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" className="bg-forest border-mint/20 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="prizePool"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-mint">Prize Pool ($)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" className="bg-forest border-mint/20 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="draftDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-mint">Draft Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="datetime-local" className="bg-forest border-mint/20 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full bg-mint hover:bg-mint/90 text-forest">
              Update League
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};