import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, CalendarDays, Shield } from "lucide-react";
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
import { useAuthState } from "@/hooks/useAuthState";
import { UserAvatar } from "@/components/auth/verification/UserAvatar";
import { CommissionerActions } from "./CommissionerActions";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MarketplaceListing } from "@/types/database/marketplace-league";

interface LeagueCardProps {
  league: MarketplaceListing;
}

export const LeagueCard = ({ league }: LeagueCardProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthState();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);

  const isCommissioner = user?.id === league.commissioner.user_id;

  const deleteLeagueMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', league.id);

      if (error) throw error;
      return league.id;
    },
    onMutate: async (leagueId) => {
      await queryClient.cancelQueries({ queryKey: ['marketplace-listings'] });
      const previousLeagues = queryClient.getQueryData(['marketplace-listings']);
      queryClient.setQueryData(['marketplace-listings'], (old: MarketplaceListing[] = []) => {
        return old.filter(l => l.id !== league.id);
      });
      return { previousLeagues };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['marketplace-listings'], context?.previousLeagues);
      toast({
        title: "Error",
        description: "Failed to delete league. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "League has been deleted.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
    },
  });

  const handleViewDetails = () => {
    if (isAuthenticated) {
      navigate(`/marketplace/${league.id}`);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Card className="bg-gray-50 dark:bg-forest-light/30 dark:border-mint/10 backdrop-blur-sm overflow-hidden">
      <div 
        className="h-48 w-full bg-cover bg-center relative"
        style={{ 
          backgroundImage: !imageError && league.image ? `url(${league.image})` : 'none',
          backgroundColor: imageError || !league.image ? 'rgba(0, 255, 179, 0.05)' : 'transparent'
        }}
      >
        {(imageError || !league.image) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="w-20 h-20 dark:text-mint/20" />
          </div>
        )}
        {league.image && <img 
          src={league.image} 
          alt={league.title}
          className="hidden"
          onError={handleImageError}
        />}
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-sky-900 dark:text-white mb-1 text-left">{league.title}</h3>
            {league.commissioner && (
              <UserAvatar user={league.commissioner} />
            )}
          </div>
          <div className="flex items-start gap-2">
            <div className="bg-sky-900/10 dark:bg-mint/10 px-3 py-1 rounded-full">
              <span className="text-sky-900 dark:text-mint text-sm">{league.season} Season</span>
            </div>
            {isCommissioner && (
              <CommissionerActions 
                league={league}
                onDelete={() => deleteLeagueMutation.mutate()}
              />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sky-900 dark:text-white/60">
            <Trophy className="h-4 w-4" />
            <span>${league.prize_pool} Prize Pool</span>
          </div>
          <div className="flex items-center gap-2 text-sky-900 dark:text-white/60">
            <Users className="h-4 w-4" />
            <span>{league.filled_spots}/{league.total_spots} Teams</span>
          </div>
          <div className="flex items-center gap-2 text-sky-900 dark:text-white/60">
            <CalendarDays className="h-4 w-4" />
            <span>Draft: {new Date(league.draft_date || '').toLocaleDateString()}</span>
          </div>
        </div>

        <div className="pt-4">
          {isAuthenticated ? (
            <Button 
              className="w-full bg-sky-900 dark:bg-mint dark:hover:bg-mint/90 text-gray-100 hover:bg-sky-900/80 dark:text-forest"
              onClick={handleViewDetails}
            >
              View Details
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full bg-sky-900 text-gray-100 dark:bg-mint dark:hover:bg-mint/90 dark:text-forest">
                  View Details
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="dark:bg-forest-light dark:border-mint/10">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-sky-900 dark:text-mint">Sign in Required</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-500 dark:text-white/60">
                    You need to sign in or create an account to view league details.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="dark:bg-forest-light dark:text-mint dark:hover:bg-forest-light/80">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-sky-900 text-gray-50 dark:bg-mint dark:text-forest dark:hover:bg-mint/90"
                    onClick={() => navigate('/auth')}
                  >
                    Sign In
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </Card>
  );
};