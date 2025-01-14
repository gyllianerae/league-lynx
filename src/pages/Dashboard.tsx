import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLeagues } from '@/hooks/useLeagues';
import { useQuery } from '@tanstack/react-query';
import { TeamOverview } from '@/components/dashboard/TeamOverview';
import { CommissionerDashboard } from '@/components/dashboard/CommissionerDashboard';
import { PlayerUpdatesSection } from '@/components/dashboard/PlayerUpdatesSection';
import { MyPlayersSection } from '@/components/dashboard/MyPlayersSection';
import { YearSelector } from '@/components/dashboard/YearSelector';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState('2025');
  const { leagues: allLeagues, isLoading: isLeaguesLoading } = useLeagues();
  const leagues = allLeagues?.filter(league => league.season === selectedYear);

  // Query for user role
  const { data: profile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Query for player updates (injured, inactive players)
  const { data: playerUpdates } = useQuery({
    queryKey: ['player-updates-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .or('injury_status.neq.null,status.eq.Inactive')
        .order('last_updated', { ascending: false })
        .limit(4);

      if (error) throw error;
      return data;
    }
  });

  // Query for my players
  const { data: myPlayers, isLoading: isPlayersLoading } = useQuery({
    queryKey: ['my-players-dashboard', leagues?.map(l => l.league_id)],
    queryFn: async () => {
      if (!leagues?.length) return [];
      
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

      if (playerIds.size === 0) return [];
      
      const { data: players, error } = await supabase
        .from('players')
        .select('*')
        .in('player_id', Array.from(playerIds))
        .limit(6);

      if (error) throw error;
      return players;
    },
    enabled: !!leagues?.length,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to access the dashboard");
        navigate('/auth');
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#F1F1F1]">Dashboard</h1>
        <div className="flex gap-2">
          <YearSelector 
            selectedYear={selectedYear} 
            onYearChange={setSelectedYear}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-forest-light/50 backdrop-blur-md text-mint border-mint/10 hover:bg-forest-light/70 hover:text-mint/90"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                External Links
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-forest-light/90 backdrop-blur-md border-mint/10">
              {EXTERNAL_LINKS.map((link) => (
                <DropdownMenuItem
                  key={link.name}
                  className="text-mint hover:bg-forest-light/50 cursor-pointer"
                  onClick={() => window.open(link.url, '_blank')}
                >
                  {link.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <WelcomeBanner />
      
      <Card className="bg-forest-light/30 border-none shadow-lg backdrop-blur-md p-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-forest-light/50 backdrop-blur-md border-none w-full justify-start mb-6">
            <TabsTrigger 
              value="overview"
              className="text-[#F1F1F1] data-[state=active]:bg-mint/10 data-[state=active]:text-mint"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="players"
              className="text-[#F1F1F1] data-[state=active]:bg-mint/10 data-[state=active]:text-mint"
            >
              Players
            </TabsTrigger>
            <TabsTrigger 
              value="news"
              className="text-[#F1F1F1] data-[state=active]:bg-mint/10 data-[state=active]:text-mint"
            >
              News
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {profile?.role === 'commissioner' ? (
              <CommissionerDashboard />
            ) : (
              <TeamOverview leagues={leagues} isLoading={isLeaguesLoading} />
            )}
          </TabsContent>
          
          <TabsContent value="players">
            <MyPlayersSection />
          </TabsContent>
          
          <TabsContent value="news">
            <PlayerUpdatesSection players={playerUpdates} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

const EXTERNAL_LINKS = [
  { name: 'Sleeper', url: 'https://sleeper.com' },
  { name: 'Fantrax', url: 'https://fantrax.com' },
  { name: 'LeagueSafe', url: 'https://leaguesafe.com' },
  { name: 'NFL', url: 'https://nfl.com' },
  { name: 'ESPN', url: 'https://www.espn.com/fantasy/football/' },
  { name: 'MyFantasyLeague', url: 'https://www.myfantasyleague.com' },
];

export default DashboardPage;