import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Flag, School, Ruler, Weight, Hash, Check, X } from "lucide-react";
import { PerformanceChart } from "./profile/PerformanceChart";
import { PriceChart } from "./profile/PriceChart";
import { PlayerStats } from "./profile/PlayerStats";
import { PlayerTeams } from "./profile/PlayerTeams";

export function PlayerProfile() {
  const { playerId } = useParams();
  const navigate = useNavigate();

  const { data: player, isLoading } = useQuery({
    queryKey: ['player', playerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('player_id', playerId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch user's leagues to check player availability
  const { data: leagues, isLoading: isLoadingLeagues } = useQuery({
    queryKey: ['user-leagues'],
    queryFn: async () => {
      const { data: platformUsers } = await supabase
        .from('platform_users')
        .select('id');

      if (!platformUsers?.length) return [];

      const { data: leagues } = await supabase
        .from('leagues')
        .select('*, platform_users(*)');

      return leagues || [];
    },
  });

  // Fetch rosters for each league
  const { data: leagueAvailability, isLoading: isLoadingRosters } = useQuery({
    queryKey: ['league-rosters', playerId, leagues],
    enabled: !!leagues?.length,
    queryFn: async () => {
      if (!leagues) return [];

      const availability = await Promise.all(
        leagues.map(async (league) => {
          const response = await fetch(
            `https://api.sleeper.app/v1/league/${league.league_id}/rosters`
          );
          const rosters = await response.json();

          // Get league users to match with rosters
          const usersResponse = await fetch(
            `https://api.sleeper.app/v1/league/${league.league_id}/users`
          );
          const users = await usersResponse.json();

          const rosterWithPlayer = rosters.find((roster: any) => 
            roster.players?.includes(playerId)
          );

          const owner = rosterWithPlayer 
            ? users.find((user: any) => user.user_id === rosterWithPlayer.owner_id)
            : null;

          return {
            league_name: league.name,
            is_available: !rosterWithPlayer,
            owner_name: owner?.display_name || owner?.username || 'Unknown Owner'
          };
        })
      );

      return availability;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-8">
        <div className="flex justify-start w-full">
          <Button 
            variant="ghost" 
            className="text-sky-900 dark:text-mint hover:text-mint/80 transition-colors"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to my team
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Main player card skeleton */}
          <div className="col-span-12 lg:col-span-8">
            <Card className="bg-gray-100 dark:bg-forest-light/50 backdrop-blur-xl p-6 border border-mint/10">
              <Skeleton className="w-full h-[300px] rounded-lg mb-6" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </div>
            </Card>
          </div>

          {/* Stats card skeleton */}
          <div className="col-span-12 lg:col-span-4">
            <Card className="bg-forest-light/50 backdrop-blur-xl p-6 border border-mint/10">
              <PlayerStats isLoading={true} />
            </Card>
          </div>

          {/* Charts skeletons */}
          <div className="col-span-12 lg:col-span-6">
            <Card className="bg-forest-light/50 backdrop-blur-xl p-6 border border-mint/10">
              <Skeleton className="h-[200px] w-full" />
            </Card>
          </div>
          <div className="col-span-12 lg:col-span-6">
            <Card className="bg-forest-light/50 backdrop-blur-xl p-6 border border-mint/10">
              <Skeleton className="h-[200px] w-full" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="text-4xl font-bold text-mint mb-2 animate-fade-in">Player Not Found</div>
        <div className="text-white/60 text-center max-w-md mb-6 animate-fade-in delay-100">
          We couldn't find the player you're looking for. They might have been traded or removed from the roster.
        </div>
        <Button 
          onClick={() => navigate(-1)}
          className="bg-mint text-forest hover:bg-mint/90 transition-all duration-300 animate-fade-in delay-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      <div className="flex justify-start w-full">
        <Button 
          variant="ghost" 
          className="text-sky-900 dark:text-mint dark:hover:text-mint/80 transition-colors group"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to my team
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main player card */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="bg-gray-100 dark:bg-forest-light/50 backdrop-blur-xl p-6 border dark:border-mint/10 dark:hover:border-mint/20 transition-all duration-300 shadow-lg h-full">
            <div className="relative mb-6 group bg-gray-200 dark:bg-forest rounded-lg">
              {player.image_url && (
                <img
                  src={player.image_url}
                  alt={player.full_name}
                  className="w-full h-[300px] object-contain object-top rounded-lg shadow-lg transition-transform duration-300"
                />
              )}
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl md:text-4xl font-bold text-sky-900 dark:text-white tracking-tight">
                  {player.full_name}
                </h1>
                <span className="text-2xl font-bold text-sky-900 dark:text-mint dark:bg-mint/10 px-3 py-1 rounded-full">
                  {player.fantasy_positions?.[0]}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 text-sky-900 dark:text-white/80 group">
                  <Flag className="h-6 w-6 text-sky-900 dark:text-mint group-hover:scale-110 transition-transform" />
                  <span className="text-lg transition-colors">{player.team || 'Free Agent'}</span>
                </div>
                <div className="flex items-center gap-3 text-sky-900 dark:text-white/80 group">
                  <Hash className="h-6 w-6 text-sky-900 dark:text-mint group-hover:scale-110 transition-transform" />
                  <span className="text-lg transition-colors">Number: {player.number || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-sky-900 dark:text-white/80 group">
                  <School className="h-6 w-6 text-sky-900 dark:text-mint group-hover:scale-110 transition-transform" />
                  <span className="text-lg transition-colors">College: {player.college || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-sky-900 dark:text-white/80 group">
                  <Ruler className="h-6 w-6 text-sky-900 dark:text-mint group-hover:scale-110 transition-transform" />
                  <span className="text-lg transition-colors">Height: {player.height || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-sky-900 dark:text-white/80 group">
                  <Weight className="h-6 w-6 text-sky-900 dark:text-mint group-hover:scale-110 transition-transform" />
                  <span className="text-lg transition-colors">Weight: {player.weight ? `${player.weight} lbs` : 'N/A'}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick stats card */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="bg-gray-100 dark:bg-forest-light/50 backdrop-blur-xl p-6 border dark:border-mint/10 hover:border-mint/20 transition-all duration-300 shadow-lg h-full">
            <PlayerStats player={player} showQuickStatsOnly={true} />
          </Card>
        </div>

        {/* League Availability Card */}
        <div className="col-span-12">
          <Card className="bg-gray-100 dark:bg-forest-light/50 backdrop-blur-xl p-6 border dark:border-mint/10 dark:hover:border-mint/20 transition-all duration-300 shadow-lg">
            <h2 className="text-xl font-semibold text-sky-900 dark:text-mint mb-6 flex items-center gap-2">
              League Availability
            </h2>
            {isLoadingLeagues || isLoadingRosters ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : leagueAvailability?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leagueAvailability.map((league, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg bg-gray-200 dark:bg-forest-light/30 border dark:border-mint/10 dark:hover:border-mint/20 transition-all group"
                  >
                    <div className="font-medium text-sky-900 dark:text-white mb-2 text-start">{league.league_name}</div>
                    <div className="flex items-center gap-2 text-sm">
                      {league.is_available ? (
                        <>
                          <Check className="h-4 w-4 text-green-700 dark:text-green-400" />
                          <span className="text-green-700 dark:text-green-400">Available</span>
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 text-red-400" />
                          <span className="text-white/60">Owned by {league.owner_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                No leagues found. Join or create a league to track player availability.
              </div>
            )}
          </Card>
        </div>

        {/* Detailed stats card */}
        <div className="col-span-12">
          <Card className="bg-gray-100 dark:bg-forest-light/50 backdrop-blur-xl p-6 border dark:border-mint/10 dark:hover:border-mint/20 transition-all duration-300 shadow-lg">
            <PlayerStats player={player} showDetailedStatsOnly={true} />
          </Card>
        </div>

        {/* Teams & Leagues card */}
        <div className="col-span-12">
          <PlayerTeams playerId={playerId || ''} />
        </div>

        {/* Performance and Price charts */}
        <div className="col-span-12 lg:col-span-6">
          <Card className="bg-gray-100 dark:bg-forest-light/50 backdrop-blur-xl p-6 border dark:border-mint/10 dark:hover:border-mint/20 transition-all duration-300 shadow-lg">
            <PerformanceChart />
          </Card>
        </div>
        <div className="col-span-12 lg:col-span-6">
          <Card className="bg-gray-100 dark:bg-forest-light/50 backdrop-blur-xl p-6 border dark:border-mint/10 dark:hover:border-mint/20 transition-all duration-300 shadow-lg">
            <PriceChart />
          </Card>
        </div>
      </div>
    </div>
  );
}