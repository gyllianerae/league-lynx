import { LeagueCard } from "./LeagueCard";
import { MarketplaceListing } from "@/types/database/marketplace-league";

interface MarketplaceGridProps {
  leagues: MarketplaceListing[];
}

export const MarketplaceGrid = ({ leagues }: MarketplaceGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {leagues.map((league) => (
        <LeagueCard key={league.id} league={league} />
      ))}
    </div>
  );
};