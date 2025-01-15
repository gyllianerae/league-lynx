import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Database } from "@/integrations/supabase/types";
import { useLeagues } from "@/hooks/useLeagues";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/utils/sleeper";

type UserRole = Database["public"]["Enums"]["user_role"];

export default function MyLeagues() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole>("regular_user");
  const { leagues, isLoading } = useLeagues();

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .single();
      
      if (profile?.role) {
        setUserRole(profile.role);
      }
    };

    fetchUserRole();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-mint">Loading...</div>
      </div>
    );
  }

  if (!leagues?.length) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-mint mb-4">
          {userRole === "commissioner" ? "No Leagues Found" : "No Teams Found"}
        </h2>
        <p className="text-white/70">
          {userRole === "commissioner" 
            ? "You haven't created any leagues yet." 
            : "You haven't joined any teams yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {/* <h2 className="text-2xl font-bold text-foreground">
          {userRole === "commissioner" ? "My Leagues" : "My Teams"}
        </h2> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leagues.map((league) => (
          <Card 
            key={league.id} 
            className="bg-forest-light/50 backdrop-blur-xl border-mint/10 cursor-pointer transition-all duration-200 hover:bg-forest-light/70 overflow-hidden"
            onClick={() => navigate(`/leagues/${league.league_id}`)}
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={getAvatarUrl(league.avatar_id)} 
                    alt={league.name}
                  />
                  <AvatarFallback className="bg-forest text-mint">
                    {league.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg font-semibold text-mint">
                    {userRole === "commissioner" 
                      ? league.name 
                      : league.settings?.team_name || 'Unnamed Team'}
                  </CardTitle>
                  <p className="text-sm text-white/60">
                    {userRole === "commissioner" 
                      ? `Season ${league.season}` 
                      : league.name}
                  </p>
                </div>
              </div>
              {league.settings?.rank === 1 && (
                <Star className="h-5 w-5 text-divine fill-divine" />
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-white/70">
                    <Users className="h-4 w-4" />
                    <span>{league.total_rosters} Teams</span>
                  </div>
                  {userRole !== "commissioner" && (
                    <div className="text-white/70">
                      Record: {league.settings?.wins || 0}-{league.settings?.losses || 0}
                      {league.settings?.ties > 0 ? `-${league.settings.ties}` : ''}
                    </div>
                  )}
                </div>
                {league.settings?.fpts !== undefined && (
                  <div className="flex items-center justify-between text-sm text-white/70">
                    <span>Points For:</span>
                    <span>{league.settings.fpts + (league.settings.fpts_decimal || 0) / 100}</span>
                  </div>
                )}
                {league.draft_id && (
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Calendar className="h-4 w-4" />
                    <span>Draft {league.status === 'pre_draft' ? 'Pending' : 'Completed'}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}