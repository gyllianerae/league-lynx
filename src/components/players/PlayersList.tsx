import { SleeperPlayer } from "@/types/sleeper/player";
import { PlayerCard } from "./PlayerCard";
import { Skeleton } from "@/components/ui/skeleton";
import { UsersRound } from "lucide-react";

interface PlayersListProps {
  players: SleeperPlayer[];
  onPlayerClick: (player: SleeperPlayer) => void;
  isLoading: boolean;
  viewMode?: "leagues" | "teams";
}

export const PlayersList = ({ players, onPlayerClick, isLoading, viewMode = "leagues" }: PlayersListProps) => {
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
        <PlayerCard
          key={player.player_id}
          player={player}
          onClick={() => onPlayerClick(player)}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
};