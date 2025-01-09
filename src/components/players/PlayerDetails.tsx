import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SleeperPlayer } from "@/types/sleeper/player";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, MapPin, Calendar, Activity, ArrowRight } from "lucide-react";

interface PlayerDetailsProps {
  player: SleeperPlayer | null;
  isOpen?: boolean;
  onClose: () => void;
}

export function PlayerDetails({ player, isOpen = true, onClose }: PlayerDetailsProps) {
  const navigate = useNavigate();
  
  if (!player) return null;

  const handleViewProfile = () => {
    onClose();
    navigate(`/players/profile/${player.player_id}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gradient-to-br from-forest-light/95 to-forest/95 backdrop-blur-xl border-2 border-mint/30 shadow-[0_0_15px_rgba(100,255,218,0.1)] rounded-xl overflow-hidden">
        <DialogHeader className="space-y-6">
          <div className="relative">
            {/* Decorative elements for baseball card look */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-mint/0 via-mint/20 to-mint/0" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-mint/0 via-mint/20 to-mint/0" />
            
            <div className="flex flex-col md:flex-row items-center gap-6 p-4">
              <div className="relative w-32 h-32 md:w-40 md:h-40">
                <div className="absolute inset-0 bg-gradient-to-br from-mint/10 to-transparent rounded-full" />
                <Avatar className="w-full h-full border-2 border-mint/30 shadow-[0_0_15px_rgba(100,255,218,0.15)]">
                  <AvatarImage 
                    src={player.image_url || '/placeholder.svg'} 
                    alt={player.full_name}
                    className="object-cover bg-forest"
                  />
                  <AvatarFallback className="bg-forest text-mint text-2xl">
                    {player.full_name?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 text-center md:text-left">
                <DialogTitle className="text-divine text-2xl md:text-3xl mb-2 font-bold tracking-wider">
                  {player.full_name}
                </DialogTitle>
                <div className="flex items-center justify-center md:justify-start gap-2 text-mint/80">
                  <User className="w-4 h-4" />
                  <span className="font-semibold">{player.position || 'N/A'}</span>
                  <span className="mx-2 text-mint/40">•</span>
                  <MapPin className="w-4 h-4" />
                  <span className="font-semibold">{player.team || 'FA'}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-6 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-forest/60 to-forest-light/60 backdrop-blur-md p-4 rounded-lg border border-mint/20 shadow-inner">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-mint/80" />
                <p className="text-mint/80 font-semibold">Age</p>
              </div>
              <p className="text-divine text-lg">{player.age || 'N/A'}</p>
            </div>
            <div className="bg-gradient-to-br from-forest/60 to-forest-light/60 backdrop-blur-md p-4 rounded-lg border border-mint/20 shadow-inner">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-mint/80" />
                <p className="text-mint/80 font-semibold">Status</p>
              </div>
              <p className="text-divine text-lg">{player.status || 'Active'}</p>
            </div>
          </div>

          {player.injury_status && (
            <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 backdrop-blur-md p-4 rounded-lg border border-red-500/30 shadow-inner">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-400" />
                <p className="text-red-400 font-semibold">Injury Status</p>
              </div>
              <p className="text-red-400 text-lg mt-2">{player.injury_status}</p>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleViewProfile}
              className="bg-gradient-to-r from-mint to-mint/90 text-forest hover:from-mint/90 hover:to-mint/80 transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg"
            >
              View Full Profile
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}