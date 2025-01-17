import { SleeperPlayer } from "@/types/sleeper/player";
import { Card } from "@/components/ui/card";
import { useLeagues } from "@/hooks/useLeagues";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Hash, Clock } from "lucide-react";

interface PlayerCardProps {
  player: SleeperPlayer;
  onClick: () => void;
  viewMode?: "leagues" | "teams";
}

export const PlayerCard = ({ player, onClick, viewMode = "leagues" }: PlayerCardProps) => {
  const { leagues } = useLeagues();
  const playerName = `${player.first_name} ${player.last_name}`;
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
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

  // Construct the image URL based on player ID
  const getPlayerImageUrl = (playerId: string) => {
    return `https://sleepercdn.com/content/nfl/players/${playerId}.jpg`;
  };
  
  return (
    <Card
      className="bg-gray-50 hover:bg-gray-200 dark:bg-forest-light/30 dark:border-mint/10 dark:hover:bg-forest-light/40 transition-colors cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className="flex items-start p-4 gap-4">
        <div className="relative">
          <Avatar className="w-16 h-16">
            <AvatarImage
              src={getPlayerImageUrl(player.player_id)}
              alt={playerName}
              className="object-cover bg-forest"
            />
            <AvatarFallback className="bg-forest text-mint text-xl font-bold">
              {getInitials(playerName)}
            </AvatarFallback>
          </Avatar>
          {player.injury_status && (
            <div className="absolute -top-1 -right-1">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <h3 className="text-sky-900 dark:text-mint font-semibold text-left flex items-center gap-2">
              {playerName}
              <span className={`text-sm font-medium ${getPositionColor(player.position || '')}`}>
                {player.position}
              </span>
            </h3>
            <div className="flex items-center gap-2 text-sm text-sky-800 dark:text-white/60">
              <span>{player.team || 'Free Agent'}</span>
              {player.number && (
                <>
                  <span className="dark:text-white/20">•</span>
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    {player.number}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {player.injury_status && (
              <Badge variant="outline" className="bg-red-900/50 text-red-400 text-xs">
                {player.injury_status}
              </Badge>
            )}
            {player.years_exp !== undefined && (
              <Badge variant="outline" className="bg-forest-light/50 text-mint/80 text-xs">
                {player.years_exp} {player.years_exp === 1 ? 'year' : 'years'} exp
              </Badge>
            )}
            {player.age && (
              <div className="flex items-center gap-1 text-xs text-sky-800 dark:text-white/60">
                <Clock className="h-3 w-3" />
                {player.age} years old
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};