import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface MarketplaceFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sportFilter: string;
  setSportFilter: (sport: string) => void;
  seasonFilter: string;
  setSeasonFilter: (season: string) => void;
}

export const MarketplaceFilters = ({
  searchQuery,
  setSearchQuery,
  sportFilter,
  setSportFilter,
  seasonFilter,
  setSeasonFilter,
}: MarketplaceFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-between">
      <div className="flex-1 min-w-[300px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-900 dark:text-mint/40 h-4 w-4" />
          <Input
            placeholder="Search leagues..."
            className="pl-10 bg-gray-100 dark:bg-forest-light/50 text-sky-900 dark:border-mint/10 dark:text-mint"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex gap-4 flex-wrap">
        <Select value={sportFilter} onValueChange={setSportFilter}>
          <SelectTrigger className="w-[180px] bg-gray-100 dark:bg-forest-light/50 text-sky-900 dark:border-mint/10 dark:text-mint">
            <SelectValue placeholder="All Sports" />
          </SelectTrigger>
          <SelectContent className="bg-gray-100 dark:bg-forest-light/100 dark:text-mint border dark:border-mint/10 rounded-md">
            <SelectItem value="all" className="text-sky-900 hover:bg-gray-200 dark:hover:bg-mint/10 dark:focus:bg-mint/20 dark:text-mint cursor-pointer">All Sports</SelectItem>
            <SelectItem value="football" className="text-sky-900 hover:bg-gray-200 dark:hover:bg-mint/10 dark:focus:bg-mint/20 dark:text-mint cursor-pointer">Football</SelectItem>
            <SelectItem value="basketball" className="text-sky-900 hover:bg-gray-200 dark:hover:bg-mint/10 dark:focus:bg-mint/20 dark:text-mint cursor-pointer">Basketball</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={seasonFilter} onValueChange={setSeasonFilter}>
          <SelectTrigger className="w-[180px] bg-gray-100 text-sky-900 dark:bg-forest-light/50 dark:border-mint/10 dark:text-mint">
            <SelectValue placeholder="Season" />
          </SelectTrigger>
          <SelectContent className="bg-gray-100 text-sky-900 dark:bg-forest-light/100 dark:text-mint border dark:border-mint/10 rounded-md">
            <SelectItem value="all" className="dark:hover:bg-mint/10 hover:bg-gray-200 dark:focus:bg-mint/20 dark:text-mint cursor-pointer">All Seasons</SelectItem>
            <SelectItem value="2024" className="dark:hover:bg-mint/10 hover:bg-gray-200 dark:focus:bg-mint/20 dark:text-mint cursor-pointer">2024 Season</SelectItem>
            <SelectItem value="2025" className="dark:hover:bg-mint/10 hover:bg-gray-200 dark:focus:bg-mint/20 dark:text-mint cursor-pointer">2025 Season</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};