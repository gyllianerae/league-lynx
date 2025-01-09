import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { PlayersList } from '@/components/players/PlayersList';
import { SleeperPlayer } from '@/types/sleeper/player';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getSleeperTrendingPlayers } from '@/utils/sleeper/api/players';
import { toast } from 'sonner';

// SleeperPlayer type to describe the player object
type SleeperTrendingPlayer = {
  player_id: string;
  count: number;
};

export const MyPlayersSection = ({ players }: { players: SleeperPlayer[] | null }) => {
  const navigate = useNavigate();
  
  // **Fetch all NFL players directly from Sleeper API**
  const { data: allPlayers, isLoading: isAllPlayersLoading } = useQuery<SleeperPlayer[]>({
    queryKey: ['all-players'],
    queryFn: async (): Promise<SleeperPlayer[]> => {
      try {
        const response = await fetch('https://api.sleeper.app/v1/players/nfl');
        if (!response.ok) {
          throw new Error(`Failed to fetch all players: ${response.statusText}`);
        }
        const playersData: Record<string, SleeperPlayer> = await response.json();
        console.log('All Players from API:', playersData);
        return Object.values(playersData); // Convert object to array of players
      } catch (error) {
        console.error('Error fetching all players:', error);
        toast.error('Failed to fetch all players');
        return [];
      }
    },
  });

  // **Fetch trending players using utility function**
  const { data: trendingPlayers, isLoading: isTrendingLoading } = useQuery<SleeperPlayer[]>({
    queryKey: ['trending-players'],
    queryFn: async () => {
      try {
        const trendingData: SleeperTrendingPlayer[] = await getSleeperTrendingPlayers('nfl', 'add', 24, 25);
        console.log('Trending Players Data:', trendingData);

        if (!allPlayers) return [];

        // **Filter trending players from allPlayers**
        return allPlayers.filter((player) =>
          trendingData.some((tp) => tp.player_id === player.player_id)
        );
      } catch (error) {
        console.error('Error fetching trending players:', error);
        toast.error('Failed to fetch trending players');
        return [];
      }
    },
    enabled: !!allPlayers,  // Enable trending players query only after allPlayers is fetched
  });
  
  const [showTrending, setShowTrending] = useState(false);

  const handlePlayerClick = (player: SleeperPlayer) => {
    navigate(`/players/profile/${player.player_id}`);
  };

  const displayedPlayers = showTrending ? trendingPlayers : players;

  console.log("Displayed players:", trendingPlayers);

  return (
    <Card className="bg-forest-light/30 border-mint/10">
      <CardHeader className="flex flex-row justify-between items-center p-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-mint">My Players</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTrending(!showTrending)}
            className={`bg-forest-light/30 border-mint/20 hover:bg-forest-light/40 ${
              showTrending ? 'text-yellow-400' : 'text-mint'
            }`}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {showTrending ? 'Show All' : 'Show Trending'}
          </Button>
        </div>
        <Link 
          to="/players/my-players" 
          className="text-mint hover:text-mint/80 flex items-center gap-1"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      
      <CardContent className="p-4">
        {displayedPlayers && (
          <PlayersList 
            players={displayedPlayers || []} 
            onPlayerClick={handlePlayerClick} 
            isLoading={isTrendingLoading || isAllPlayersLoading}
          />
        )}
      </CardContent>
    </Card>
  );
};
