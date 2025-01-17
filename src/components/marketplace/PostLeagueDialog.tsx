import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthState } from "@/hooks/useAuthState";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { MarketplaceListing } from "@/types/database/marketplace-league";

interface PostLeagueFormData {
  title: string;
  description: string;
  totalSpots: number;
  entryFee: number;
  prizePool: number;
  draftDate: string;
  season: string;
}

export const PostLeagueDialog = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthState();
  const form = useForm<PostLeagueFormData>({
    defaultValues: {
      season: new Date().getFullYear().toString()
    }
  });
  const queryClient = useQueryClient();

  const createLeagueMutation = useMutation({
    mutationFn: async (data: PostLeagueFormData) => {
      const { data: result, error } = await supabase
        .from('marketplace_listings')
        .insert({
          title: data.title,
          description: data.description,
          commissioner_id: user?.id,
          sport: 'football',
          season: data.season,
          entry_fee: data.entryFee,
          prize_pool: data.prizePool,
          total_spots: data.totalSpots,
          filled_spots: 0,
          draft_date: new Date(data.draftDate).toISOString(),
          status: 'open'
        })
        .select('*, commissioner:profiles(*)')
        .single();

      if (error) throw error;
      return result;
    },
    onMutate: async (newLeague) => {
      await queryClient.cancelQueries({ queryKey: ['marketplace-listings'] });
      const previousLeagues = queryClient.getQueryData(['marketplace-listings']);

      queryClient.setQueryData(['marketplace-listings'], (old: MarketplaceListing[] = []) => {
        const optimisticLeague = {
          id: Date.now(),
          title: newLeague.title,
          description: newLeague.description,
          commissioner: {
            user_id: user?.id,
            username: user?.email?.split('@')[0] || 'Unknown',
          },
          season: newLeague.season,
          prize_pool: newLeague.prizePool,
          total_spots: newLeague.totalSpots,
          filled_spots: 0,
          draft_date: new Date(newLeague.draftDate).toISOString(),
          entry_fee: newLeague.entryFee,
        };
        return [...old, optimisticLeague];
      });

      return { previousLeagues };
    },
    onError: (err, newLeague, context) => {
      queryClient.setQueryData(['marketplace-listings'], context?.previousLeagues);
      toast({
        title: "Error",
        description: "Failed to create league. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "League has been posted to the marketplace.",
      });
      setOpen(false);
      form.reset();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
    },
  });

  const onSubmit = (data: PostLeagueFormData) => {
    createLeagueMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-sky-900 text-gray-50 dark:bg-mint dark:hover:bg-mint/90 dark:text-forest">
          <Plus className="mr-2 h-4 w-4" /> Post League
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-100 dark:bg-forest-light dark:border-mint/10">
        <DialogHeader>
          <DialogTitle className="text-sky-900 dark:text-mint">Post New League</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sky-900 dark:text-mint">League Title</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-gray-50 text-sky-900 dark:bg-forest dark:border-mint/20 dark:text-white" />
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
                  <FormLabel className="text-sky-900 dark:text-mint">Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="bg-gray-50 text-sky-900 dark:bg-forest dark:border-mint/20 dark:text-white" />
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
                    <FormLabel className="text-sky-900 dark:text-mint">Total Spots</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" className="bg-gray-50 text-sky-900 dark:bg-forest dark:border-mint/20 dark:text-white" />
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
                    <FormLabel className="text-sky-900 dark:text-mint">Entry Fee ($)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" className="bg-gray-50 text-sky-900 dark:bg-forest dark:border-mint/20 dark:text-white" />
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
                    <FormLabel className="text-sky-900 dark:text-mint">Prize Pool ($)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" className="bg-gray-50 text-sky-900 dark:bg-forest dark:border-mint/20 dark:text-white" />
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
                    <FormLabel className="text-sky-900 dark:text-mint">Draft Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="datetime-local" className="bg-gray-50 text-sky-900 dark:bg-forest dark:border-mint/20 dark:text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="season"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sky-900 dark:text-mint">Season</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" className="bg-gray-50 text-sky-900 dark:bg-forest dark:border-mint/20 dark:text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-sky-900 text-gray-50 dark:bg-mint dark:hover:bg-mint/90 dark:text-forest">
              Create League
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};