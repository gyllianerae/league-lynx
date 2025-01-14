import { SleeperPlayer } from "@/types/sleeper/player";
import { PlayerCard } from "./PlayerCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface PlayersListProps {
  players: SleeperPlayer[];
  onPlayerClick: (player: SleeperPlayer) => void;
  isLoading: boolean;
  viewMode?: "leagues" | "teams";
}

export const PlayersList = ({ players, onPlayerClick, isLoading, viewMode = "leagues" }: PlayersListProps) => {
  const queryClient = useQueryClient();
  
  // Fetch favorite players
  const { data: favorites = [] } = useQuery({
    queryKey: ['favorite-players-ids'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('favorite_players')
        .select('player_id');

      if (error) {
        console.error('Error fetching favorites:', error);
        return [];
      }

      return data.map(f => f.player_id);
    },
  });

  const toggleFavorite = async (playerId: string) => {
    const isFavorite = favorites.includes(playerId);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorite_players')
          .delete()
          .eq('player_id', playerId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('favorite_players')
          .insert({ 
            player_id: playerId,
            user_id: (await supabase.auth.getUser()).data.user?.id 
          });

        if (error) throw error;
      }

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['favorite-players'] });
      queryClient.invalidateQueries({ queryKey: ['favorite-players-ids'] });

      toast.success(isFavorite ? 'Player removed from favorites' : 'Player added to favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-forest-light/30 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!players || players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <UsersRound className="h-16 w-16 text-mint/40 mb-4" />
        <h3 className="text-xl font-semibold text-mint mb-2">No Players Found</h3>
        <p className="text-white/60 text-center max-w-md">
          Try adjusting your filters or search criteria to find the players you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {players.map((player) => (
        <div key={player.player_id} className="relative">
          <PlayerCard
            player={player}
            onClick={() => onPlayerClick(player)}
            viewMode={viewMode}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(player.player_id);
            }}
          >
            <Star
              className={`h-5 w-5 ${
                favorites.includes(player.player_id)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-white/60 hover:text-white/80"
              }`}
            />
          </Button>
        </div>
      ))}
    </div>
  );
};