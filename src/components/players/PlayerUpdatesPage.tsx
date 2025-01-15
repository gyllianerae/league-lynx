import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SleeperPlayer } from "@/types/sleeper/player";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Newspaper } from "lucide-react";

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

export const PlayerUpdatesPage = () => {
  const { data: players, isLoading: isPlayersLoading, error: playerError } = useQuery({
    queryKey: ["player-updates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .or("injury_status.neq.null,status.eq.Inactive")
        .order("last_updated", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching player updates:", error);
        throw new Error("Failed to fetch player updates.");
      }

      return data as SleeperPlayer[];
    },
  });

  const { data: playerNews, isLoading: isNewsLoading, error: newsError } = useQuery({
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

  if (isPlayersLoading || isNewsLoading) {
    return <div className="text-mint/60">Loading player updates...</div>;
  }

  if (playerError || newsError) {
    return (
      <div className="text-red-500">
        Error loading data: {playerError ? playerError.message : newsError.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
        <h2 className="text-2xl font-bold text-foreground">Player Updates</h2>
      </div>

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="bg-forest-light/30">
          <TabsTrigger value="status">Status Updates</TabsTrigger>
          <TabsTrigger value="news" disabled className="opacity-50 cursor-not-allowed">Latest News</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          {players?.length === 0 ? (
            <p className="text-center text-gray-400">No player status updates found.</p>
          ) : (
            players.map((player) => (
              <Card
                key={player.player_id}
                className="bg-forest-light/50 border-mint/10 backdrop-blur-xl"
              >
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 rounded-lg">
                      <AvatarImage src={player.image_url || "/default-avatar.png"} alt="Player Avatar" />
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-white">{player.full_name}</span>
                        <span className="text-sm font-medium text-gray-400">{player.position || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{player.team || "Free Agent"}</span>
                        {player.number && <span className="text-gray-600">• #{player.number}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {player.injury_status && (
                      <Badge variant="outline" className="bg-red-900/50 text-red-400">
                        Injury: {player.injury_status}
                      </Badge>
                    )}
                    {player.status === "Inactive" && (
                      <Badge variant="outline" className="bg-yellow-900/50 text-yellow-400">
                        Status: Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="news" className="space-y-4">
          <ScrollArea className="pr-4">
            {playerNews.length === 0 ? (
              <div className="text-center text-gray-400 py-4">No news available at the moment</div>
            ) : (
              playerNews.map((news, index) => (
                <Card key={index} className="bg-forest-light/50 border-mint/10 backdrop-blur-xl mb-4">
                  <div className="p-4">
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
                  </div>
                </Card>
              ))
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
