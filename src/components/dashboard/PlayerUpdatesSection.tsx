import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SleeperPlayer } from '@/types/sleeper/player';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PlayerNews = {
  strEvent: string;
  strDescriptionEN: string;
  dateEvent: string;
  strTimeLocal: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string;
  intAwayScore: string;
  strHomeTeamBadge: string;
  strAwayTeamBadge: string;
  strVenue: string;
  strLeague: string;
  strThumb?: string;
  strVideo?: string;
};

interface PlayerUpdatesSectionProps {
  players: SleeperPlayer[] | null;
}

export const PlayerUpdatesSection = ({ players }: PlayerUpdatesSectionProps) => {
  const navigate = useNavigate();

  // Fetch user's leagues
  const { data: leagues } = useQuery({
    queryKey: ['user-leagues'],
    queryFn: async () => {
      const { data: leagues, error } = await supabase
        .from('leagues')
        .select('*');
      
      if (error) throw error;
      return leagues;
    }
  });

  // Fetch rosters for all leagues and get player IDs
  const { data: ownedPlayerIds } = useQuery({
    queryKey: ['owned-players', leagues],
    queryFn: async () => {
      if (!leagues?.length) return new Set<string>();
      
      const playerIds = new Set<string>();
      
      await Promise.all(leagues.map(async (league) => {
        try {
          const rostersResponse = await fetch(`https://api.sleeper.app/v1/league/${league.league_id}/rosters`);
          const rosters = await rostersResponse.json();
          
          const usersResponse = await fetch(`https://api.sleeper.app/v1/league/${league.league_id}/users`);
          const users = await usersResponse.json();
          
          const userRoster = rosters.find((roster: any) => {
            const rosterUser = users.find((user: any) => user.user_id === roster.owner_id);
            return rosterUser?.username === users.find((u: any) => u.user_id === league.platform_user_id)?.username;
          });
          
          if (userRoster?.players) {
            userRoster.players.forEach((playerId: string) => playerIds.add(playerId));
          }
        } catch (error) {
          console.error(`Error fetching roster for league ${league.league_id}:`, error);
        }
      }));

      return playerIds;
    },
    enabled: !!leagues?.length
  });

  // Fetch news data
  const { data: playerNews, isLoading: isNewsLoading } = useQuery({
    queryKey: ["player-news"],
    queryFn: async () => {
      try {
        const response = await fetch(
          "https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=133602"
        );

        if (!response.ok) {
          throw new Error(`TheSportsDB API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.results || [];
      } catch (error) {
        console.error("Error fetching player news:", error);
        return [];
      }
    },
  });

  const getInjuryBadgeColor = (injury: string) => {
    switch (injury?.toLowerCase()) {
      case 'ir':
        return 'bg-red-900/50 text-red-400';
      case 'sus':
        return 'bg-yellow-900/50 text-yellow-400';
      case 'questionable':
        return 'bg-orange-900/50 text-orange-400';
      case 'out':
        return 'bg-red-900/50 text-red-400';
      default:
        return 'bg-gray-900/50 text-gray-400';
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'QB':
        return 'text-blue-400';
      case 'RB':
        return 'text-green-400';
      case 'WR':
        return 'text-purple-400';
      case 'TE':
        return 'text-orange-400';
      case 'K':
        return 'text-yellow-400';
      case 'DEF':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  // Filter players to only show owned players with updates
  const filteredPlayers = players?.filter(player => 
    ownedPlayerIds?.has(player.player_id) && 
    (player.injury_status || player.status === 'Inactive')
  );

  return (
    <Card className="bg-gray-100 dark:bg-forest-light/30 dark:border-mint/10">
      <CardHeader className="flex flex-row justify-between items-center p-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
          <h2 className="text-2xl font-bold text-sky-900 dark:text-mint">My Player Updates</h2>
        </div>
        <Link 
          to="/players/updates" 
          className="text-sky-900 dark:text-mint dark:hover:text-mint/80 flex items-center gap-1"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>

      <CardContent className="p-4">
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="bg-gray-50 dark:bg-forest-light/30 text-sky-900">
            <TabsTrigger value="status" className="data-[state=active]:text-sky-900">Status Updates</TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:text-sky-900" disabled>Latest News</TabsTrigger>
          </TabsList>

          <TabsContent value="status">
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {filteredPlayers?.length === 0 && (
                  <div className="text-center text-gray-400 py-4">
                    No updates for your players
                  </div>
                )}
                {filteredPlayers?.map((player) => (
                  <Card 
                    key={player.player_id} 
                    className="bg-forest-light/50 border-mint/10 backdrop-blur-xl cursor-pointer hover:bg-forest-light/60 transition-colors"
                    onClick={() => navigate(`/players/profile/${player.player_id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 rounded-lg">
                          <AvatarImage src={player.image_url} />
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-white">
                              {player.full_name}
                            </span>
                            <span className={`text-sm font-medium ${getPositionColor(player.position || '')}`}>
                              {player.position}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>{player.team || 'Free Agent'}</span>
                            {player.number && (
                              <>
                                <span className="text-gray-600">•</span>
                                <span>#{player.number}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        {player.injury_status && (
                          <Badge variant="outline" className={`${getInjuryBadgeColor(player.injury_status)}`}>
                            Injury: {player.injury_status}
                          </Badge>
                        )}
                        {player.status === 'Inactive' && (
                          <Badge variant="outline" className="bg-yellow-900/50 text-yellow-400">
                            Status: Inactive
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="news">
            <ScrollArea className="h-[500px] pr-4">
              {!playerNews || playerNews.length === 0 ? (
                <div className="text-center text-gray-400 py-4">No news available at the moment</div>
              ) : (
                playerNews.map((news: PlayerNews, index: number) => (
                  <Card key={index} className="bg-forest-light/50 border-mint/10 backdrop-blur-xl mb-4">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={news.strThumb || "/default-thumbnail.png"}
                          alt="News Thumbnail"
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">{news.strEvent}</h3>
                          <p className="text-gray-400 text-sm">
                            {news.strDescriptionEN || "No additional description provided."}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                          {news.strLeague} - {news.strVenue} at {news.strTimeLocal}
                        </div>
                        <div className="text-xs flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <img
                              src={news.strHomeTeamBadge}
                              alt="Home Team Badge"
                              className="h-8 w-8 rounded-full"
                            />
                            <span className="text-white font-semibold">{news.strHomeTeam}</span>
                            <span className="text-white">({news.intHomeScore || "N/A"})</span>
                          </div>
                          <span className="text-mint/80 font-bold">vs</span>
                          <div className="flex items-center gap-1">
                            <img
                              src={news.strAwayTeamBadge}
                              alt="Away Team Badge"
                              className="h-8 w-8 rounded-full"
                            />
                            <span className="text-white font-semibold">{news.strAwayTeam}</span>
                            <span className="text-white">({news.intAwayScore || "N/A"})</span>
                          </div>
                        </div>
                      </div>
                      {news.strVideo && (
                        <div className="mt-2">
                          <a
                            href={news.strVideo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-mint hover:underline"
                          >
                            🎥 Watch Video Highlights
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};