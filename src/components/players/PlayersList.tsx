import { SleeperPlayer } from "@/types/sleeper/player";
import { PlayerCard } from "./PlayerCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, UsersRound } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface PlayersListProps {
  players: SleeperPlayer[];
  onPlayerClick: (player: SleeperPlayer) => void;
  isLoading: boolean;
  viewMode?: "leagues" | "teams";
}

export const PlayersList = ({ players, onPlayerClick, isLoading, viewMode = "leagues" }: PlayersListProps) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [sortedPlayers, setSortedPlayers] = useState<SleeperPlayer[]>([]);

  useEffect(() => {
    // Load favorites from localStorage on component mount
    const savedFavorites = localStorage.getItem('favoritePlayerIds');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  useEffect(() => {
    // Sort players with favorites at the top
    const sorted = [...players].sort((a, b) => {
      const aIsFavorite = favorites.has(a.player_id);
      const bIsFavorite = favorites.has(b.player_id);
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return 0;
    });
    setSortedPlayers(sorted);
  }, [players, favorites]);

  const toggleFavorite = (playerId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(playerId)) {
      newFavorites.delete(playerId);
    } else {
      newFavorites.add(playerId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('favoritePlayerIds', JSON.stringify([...newFavorites]));
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
      {sortedPlayers.map((player) => (
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
                favorites.has(player.player_id)
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