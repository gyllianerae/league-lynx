import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SleeperPlayer } from "@/types/sleeper/player";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const PlayerUpdatesPage = () => {
  const { data: players, isLoading } = useQuery({
    queryKey: ['player-updates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .or('injury_status.neq.null,status.eq.Inactive')
        .order('last_updated', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching player updates:', error);
        return [];
      }

      return data as SleeperPlayer[];
    }
  });

  if (isLoading) {
    return <div className="text-mint/60">Loading player updates...</div>;
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
        <h2 className="text-2xl font-bold text-mint">Player Updates</h2>
      </div>

      <div className="space-y-4">
        {players?.map((player) => (
          <Card key={player.player_id} className="bg-forest-light/50 border-mint/10 backdrop-blur-xl">
            <div className="p-4">
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
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};