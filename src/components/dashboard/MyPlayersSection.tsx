import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp, Star } from 'lucide-react';
import { PlayersList } from '@/components/players/PlayersList';
import { SleeperPlayer } from '@/types/sleeper/player';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getSleeperTrendingPlayers } from '@/utils/sleeper/api/players';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const MyPlayersSection = () => {
  const navigate = useNavigate();
  const [showTrending, setShowTrending] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  // Fetch favorite players
  const { data: favoritePlayers, isLoading: isFavoritesLoading } = useQuery({
    queryKey: ['favorite-players'],
    queryFn: async () => {
      const { data: favorites, error } = await supabase
        .from('favorite_players')
        .select('player_id');

      if (error) {
        console.error('Error fetching favorites:', error);
        toast.error('Failed to fetch favorite players');
        return [];
      }

      const playerIds = favorites.map(f => f.player_id);

      if (playerIds.length === 0) return [];

      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('*')
        .in('player_id', playerIds);

      if (playersError) {
        console.error('Error fetching player details:', playersError);
        toast.error('Failed to fetch player details');
        return [];
      }

      return players;
    },
  });

  // Fetch league players
  const { data: leaguePlayers, isLoading: isLeaguePlayersLoading } = useQuery({
    queryKey: ['my-league-players'],
    queryFn: async () => {
      // First get user's leagues
      const { data: leagues, error: leaguesError } = await supabase
        .from('leagues')
        .select('league_id');

      if (leaguesError) {
        console.error('Error fetching leagues:', leaguesError);
        toast.error('Failed to fetch leagues');
        return [];
      }

      if (!leagues?.length) return [];

      // Fetch rosters for each league
      const playerIds = new Set<string>();
      
      await Promise.all(leagues.map(async (league) => {
        try {
          const rostersResponse = await fetch(`https://api.sleeper.app/v1/league/${league.league_id}/rosters`);
          const rosters = await rostersResponse.json();
          
          const usersResponse = await fetch(`https://api.sleeper.app/v1/league/${league.league_id}/users`);
          const users = await usersResponse.json();
          
          // Make this callback async
          const userRoster = await Promise.resolve(rosters.find(async (roster: any) => {
            const rosterUser = users.find((user: any) => user.user_id === roster.owner_id);
            const { data: { user } } = await supabase.auth.getUser();
            return rosterUser?.user_id === user?.id;
          }));
          
          if (userRoster?.players) {
            userRoster.players.forEach((playerId: string) => playerIds.add(playerId));
          }
        } catch (error) {
          console.error(`Error fetching roster for league ${league.league_id}:`, error);
        }
      }));

      if (playerIds.size === 0) return [];

      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('*')
        .in('player_id', Array.from(playerIds))
        .limit(6);

      if (playersError) {
        console.error('Error fetching player details:', playersError);
        toast.error('Failed to fetch player details');
        return [];
      }

      return players;
    },
  });

  // Fetch trending players
  const { data: trendingPlayers, isLoading: isTrendingLoading } = useQuery({
    queryKey: ['trending-players'],
    queryFn: async () => {
      try {
        const trendingData = await getSleeperTrendingPlayers('nfl', 'add', 24, 25);
        
        if (!trendingData.length) return [];

        const { data: players, error } = await supabase
          .from('players')
          .select('*')
          .in('player_id', trendingData.map(tp => tp.player_id));

        if (error) {
          console.error('Error fetching trending players:', error);
          toast.error('Failed to fetch trending players');
          return [];
        }

        return players;
      } catch (error) {
        console.error('Error fetching trending players:', error);
        toast.error('Failed to fetch trending players');
        return [];
      }
    },
  });

  const handlePlayerClick = (player: SleeperPlayer) => {
    navigate(`/players/profile/${player.player_id}`);
  };

  const displayedPlayers = showTrending 
    ? trendingPlayers 
    : showFavorites 
      ? favoritePlayers 
      : leaguePlayers;
  const isLoading = showTrending 
    ? isTrendingLoading 
    : showFavorites 
      ? isFavoritesLoading 
      : isLeaguePlayersLoading;

  return (
    <Card className="bg-forest-light/30 border-mint/10">
      <CardHeader className="flex flex-row justify-between items-center p-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-mint">My Players</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowTrending(false);
                setShowFavorites(!showFavorites);
              }}
              className={`bg-forest-light/30 border-mint/20 hover:bg-forest-light/40 ${
                showFavorites ? 'text-yellow-400' : 'text-mint'
              }`}
            >
              <Star className="h-4 w-4 mr-2" />
              {showFavorites ? 'Show All' : 'Show Favorites'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowFavorites(false);
                setShowTrending(!showTrending);
              }}
              className={`bg-forest-light/30 border-mint/20 hover:bg-forest-light/40 ${
                showTrending ? 'text-yellow-400' : 'text-mint'
              }`}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {showTrending ? 'Show My Players' : 'Show Trending'}
            </Button>
          </div>
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
        <PlayersList 
          players={displayedPlayers || []} 
          onPlayerClick={handlePlayerClick} 
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};