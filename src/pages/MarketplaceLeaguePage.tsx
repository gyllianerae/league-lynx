import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Trophy, Users, CalendarDays, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/useAuthState";

interface MarketplaceLeague {
  id: number;
  title: string;
  description: string | null;
  commissioner_name: string;
  season: string;
  prize_pool: number | null;
  total_spots: number;
  filled_spots: number;
  draft_date: string | null;
}

export default function MarketplaceLeaguePage() {
  const { leagueId } = useParams();
  const parsedLeagueId = leagueId ? parseInt(leagueId) : 0;
  const { user } = useAuthState();

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        toast.error("Error fetching user profile");
        throw error;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  const { data: league, isLoading } = useQuery({
    queryKey: ['marketplace-league', parsedLeagueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          commissioner:profiles(
            first_name,
            last_name,
            username
          )
        `)
        .eq('id', parsedLeagueId)
        .single();

      if (error) {
        toast.error("Error fetching league details");
        throw error;
      }

      if (!data) {
        throw new Error("League not found");
      }

      // Format commissioner name
      const commissioner = data.commissioner;
      const commissionerName = commissioner.first_name && commissioner.last_name 
        ? `${commissioner.first_name} ${commissioner.last_name}`
        : commissioner.username || 'Unknown';

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        commissioner_name: commissionerName,
        season: data.season,
        prize_pool: data.prize_pool,
        total_spots: data.total_spots,
        filled_spots: data.filled_spots,
        draft_date: data.draft_date,
      } as MarketplaceLeague;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-mint">Loading league details...</div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-mint">League not found</div>
      </div>
    );
  }

  const handleJoinLeague = () => {
    toast.success("Request sent to commissioner!");
  };

  const showJoinButton = userProfile?.role === 'regular_user';

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div 
        className="relative h-80 rounded-xl overflow-hidden"
        style={{
          backgroundImage: `url(/lovable-uploads/afb1717a-22ca-4658-a824-4ee45d4ebe59.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/80 to-transparent backdrop-blur-sm">
          <div className="absolute bottom-0 left-0 p-8 w-full">
            <div className="flex items-start justify-between">
              <div className="backdrop-blur-xl bg-forest/30 p-6 rounded-xl border border-mint/10">
                <h1 className="text-4xl font-bold text-white mb-2">{league.title}</h1>
                <p className="text-mint/80 text-start">Commissioner: {league.commissioner_name}</p>
              </div>
              <div className="backdrop-blur-xl bg-mint/10 px-4 py-2 rounded-full border border-mint/10">
                <span className="text-mint">{league.season} Season</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* League Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-forest-light/30 border-mint/10 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-5 w-5 text-mint" />
            <h3 className="text-lg font-semibold text-mint">Prize Pool</h3>
          </div>
          <div className="text-3xl font-bold text-white text-start">
            ${league.prize_pool || 0}
          </div>
        </Card>

        <Card className="bg-forest-light/30 border-mint/10 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-5 w-5 text-mint" />
            <h3 className="text-lg font-semibold text-mint">Available Spots</h3>
          </div>
          <div className="text-3xl font-bold text-white text-start">
            {league.total_spots - league.filled_spots} of {league.total_spots}
          </div>
        </Card>

        <Card className="bg-forest-light/30 border-mint/10 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <CalendarDays className="h-5 w-5 text-mint" />
            <h3 className="text-lg font-semibold text-mint">Draft Date</h3>
          </div>
          <div className="text-3xl font-bold text-white text-start">
            {league.draft_date ? new Date(league.draft_date).toLocaleDateString() : 'TBD'}
          </div>
        </Card>
      </div>

      {/* League Description */}
      <Card className="bg-forest-light/30 border-mint/10 backdrop-blur-sm p-6">
        <h2 className="text-2xl font-bold text-mint mb-4 text-start">About this League</h2>
        <p className="text-white/80 leading-relaxed text-start">{league.description || 'No description available.'}</p>
      </Card>

      {/* Join League Button - Only show for regular users */}
      {showJoinButton && (
        <div className="flex justify-center pt-4">
          <Button 
            className="bg-mint hover:bg-mint/90 text-forest px-8 py-6 text-lg"
            onClick={handleJoinLeague}
          >
            <Shield className="mr-2 h-5 w-5" />
            Request to Join League
          </Button>
        </div>
      )}
    </div>
  );
}
