import { useState } from "react";
import { MarketplaceHero } from "@/components/marketplace/MarketplaceHero";
import { MarketplaceFilters } from "@/components/marketplace/MarketplaceFilters";
import { MarketplaceGrid } from "@/components/marketplace/MarketplaceGrid";
import { useAuthState } from "@/hooks/useAuthState";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/database/profile";
import { PostLeagueDialog } from "@/components/marketplace/PostLeagueDialog";
import { useQuery } from "@tanstack/react-query";
import { MarketplaceListing } from "@/types/database/marketplace-league";
import { mockLeagues } from "@/data/mockLeagues";

const MarketplacePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [seasonFilter, setSeasonFilter] = useState("all");
  const { isAuthenticated, user } = useAuthState();

  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user?.id,
  });

  const { data: leagues = [], isLoading } = useQuery({
    queryKey: ['marketplace-listings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          commissioner:profiles(*)
        `)
        .eq('status', 'open');

      if (error) throw error;

      // Map Supabase data to match our League interface
      const mappedLeagues = data ? data.map(listing => ({
        id: listing.id,
        title: listing.title,
        commissioner: {
          user_id: listing.commissioner.id,
          username: listing.commissioner.username || '',
          display_name: listing.commissioner.username || listing.commissioner.first_name || 'Unknown',
          avatar: '' // Since we don't have avatar in profiles, use empty string as fallback
        },
        season: listing.season,
        prize_pool: Number(listing.prize_pool) || 0,
        total_spots: listing.total_spots,
        filled_spots: listing.filled_spots,
        draft_date: listing.draft_date || new Date().toISOString(),
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475" // Default image
      })) : [];

      // Combine real listings with mock leagues
      return [...mappedLeagues, ...mockLeagues] as MarketplaceListing[];
    },
  });

  // Filter leagues based on search query and filters
  const filteredLeagues = leagues.filter((league) => {
    const matchesSearch = league.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      league.commissioner?.username?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = sportFilter === "all" || true; // Implement proper sport filtering when needed
    const matchesSeason = seasonFilter === "all" || league.season === seasonFilter;
    
    return matchesSearch && matchesSport && matchesSeason;
  });

  const showPostLeagueButton = isAuthenticated && profile?.role === 'commissioner';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-mint">Loading marketplace listings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <MarketplaceHero />
      
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <MarketplaceFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sportFilter={sportFilter}
          setSportFilter={setSportFilter}
          seasonFilter={seasonFilter}
          setSeasonFilter={setSeasonFilter}
        />
        
        {showPostLeagueButton && <PostLeagueDialog />}
      </div>

      <MarketplaceGrid leagues={filteredLeagues} />
    </div>
  );
};

export default MarketplacePage;