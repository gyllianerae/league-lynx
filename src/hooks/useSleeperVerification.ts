import { useState, useEffect } from 'react';
import { getSleeperUserByUsername } from "@/utils/sleeper";
import { SleeperUser } from "@/types/sleeper/user";

export const useSleeperVerification = (username: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [sleeperUser, setSleeperUser] = useState<SleeperUser | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSleeperUser = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 Making Sleeper API call to:', `https://api.sleeper.app/v1/user/${username}`);
        
        const user = await getSleeperUserByUsername(username);
        
        console.log('✅ Sleeper API Response:', {
          username: user.username,
          user_id: user.user_id,
          display_name: user.display_name,
          avatar: user.avatar,
          timestamp: new Date().toISOString()
        });
        
        setSleeperUser(user);
      } catch (error: any) {
        console.error('❌ Sleeper API Error:', {
          error: error.message,
          username,
          timestamp: new Date().toISOString()
        });
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSleeperUser();
  }, [username]);

  return { isLoading, sleeperUser, error };
};