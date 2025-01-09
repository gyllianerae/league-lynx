import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { handleError } from '@/utils/errorHandling';
import { League } from '@/types/database/league';

export const useLeagues = () => {
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    console.log('Setting up auth state listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // console.log('Auth state changed in useLeagues:', event, session?.user);
      setUser(session?.user || null);
      setIsAuthReady(true);
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // console.log('Initial session in useLeagues:', session?.user);
      setUser(session?.user || null);
      setIsAuthReady(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const { data: leagues, isLoading, refetch } = useQuery({
    queryKey: ['leagues', user?.id],
    queryFn: async () => {
      // console.log('Fetching leagues for user:', user?.id);
      if (!user?.id) {
        console.log('No user ID available, skipping fetch');
        return [];
      }

      try {
        // First check if the profile exists and has a Sleeper username
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('sleeper_username, onboarding_status')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          throw profileError;
        }

        if (!profile?.sleeper_username) {
          console.log('No Sleeper username found in profile');
          // toast.error('Please connect your Sleeper account first');
          return [];
        }

        // Get the platform_user_id first
        const { data: platformUser, error: platformUserError } = await supabase
          .from('platform_users')
          .select('id')
          .eq('profile_id', user.id)
          .single();

        if (platformUserError) {
          console.error('Error fetching platform user:', platformUserError);
          throw platformUserError;
        }

        if (!platformUser) {
          console.log('No platform user found');
          return [];
        }

        // console.log('Found platform user:', platformUser);
        
        // Call the Edge Function to fetch and sync leagues
        const { data: functionData, error: functionError } = await supabase.functions.invoke(
          'fetch-user-leagues',
          {
            body: {
              userId: user.id,
              sleeperUsername: profile.sleeper_username
            },
          }
        );

        if (functionError) {
          console.error('Error invoking fetch-user-leagues:', functionError);
          throw functionError;
        }

        console.log('Edge Function response:', functionData);

        // Fetch leagues with additional data
        const { data: leaguesData, error: leaguesError } = await supabase
          .from('leagues')
          .select(`
            *,
            platform_user: platform_users (
              username,
              display_name
            )
          `)
          .eq('platform_user_id', platformUser.id);

        if (leaguesError) {
          console.error('Error fetching leagues:', leaguesError);
          throw leaguesError;
        }

        // For each league, fetch users and rosters from Sleeper API
        const leaguesWithDetails = await Promise.all(
          (leaguesData as League[]).map(async (league: League) => {
            try {
              // Fetch league users
              const usersResponse = await fetch(`https://api.sleeper.app/v1/league/${league.league_id}/users`);
              const users = await usersResponse.json();
              // console.log(`Fetched ${users.length} users for league ${league.league_id}:`, users);

              // Fetch league rosters
              const rostersResponse = await fetch(`https://api.sleeper.app/v1/league/${league.league_id}/rosters`);
              const rosters = await rostersResponse.json();
              // console.log(`Fetched ${rosters.length} rosters for league ${league.league_id}:`, rosters);

              // Find the user's roster
              const userRoster = rosters.find(roster => {
                const rosterUser = users.find(user => user.user_id === roster.owner_id);
                return rosterUser?.display_name === profile.sleeper_username;
              });

              // Find user's team info
              const userData = users.find(user => user.display_name === profile.sleeper_username);
              
              // console.log('User roster found:', userRoster);
              // console.log('User data found:', userData);

              // Get team name from metadata or fallback options
              const teamName = userData?.metadata?.team_name || userData?.display_name || 'Unnamed Team';
              // console.log('Team name found:', teamName);

              // Update league with user's team info
              return {
                ...league,
                settings: {
                  ...league.settings,
                  team_name: teamName,
                  wins: userRoster?.settings?.wins || 0,
                  losses: userRoster?.settings?.losses || 0,
                  ties: userRoster?.settings?.ties || 0,
                  fpts: userRoster?.settings?.fpts || 0,
                  fpts_decimal: userRoster?.settings?.fpts_decimal || 0,
                  fpts_against: userRoster?.settings?.fpts_against || 0,
                  fpts_against_decimal: userRoster?.settings?.fpts_against_decimal || 0,
                }
              } as League;
            } catch (error) {
              console.error(`Error fetching details for league ${league.league_id}:`, error);
              return league; // Return original league data if fetch fails
            }
          })
        );

        // console.log('Leagues with details:', leaguesWithDetails);
        return leaguesWithDetails || [];
      } catch (error: any) {
        console.error('Error in league fetching process:', error);
        toast.error(error.message || 'Failed to fetch leagues');
        return [];
      }
    },
    enabled: isAuthReady && !!user?.id,
  });

  const refetchLeagues = async () => {
    try {
      if (!isAuthReady) {
        console.log('Auth not ready yet, waiting...');
        return;
      }

      if (!user?.id) {
        console.log('No user ID available, skipping refresh');
        throw new Error('No user ID available');
      }

      await refetch();
      toast.success('Successfully refreshed league data');
    } catch (error: any) {
      handleError(error, 'Failed to refresh league data');
    }
  };

  return { leagues, isLoading, user, refetchLeagues };
};