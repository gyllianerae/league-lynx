import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PlayerFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  positionFilter: string;
  onPositionChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export const PlayerFilters = ({
  searchQuery,
  onSearchChange,
  positionFilter,
  onPositionChange,
  statusFilter,
  onStatusChange,
}: PlayerFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-4 mb-8">
      <div className="flex-1 min-w-[300px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-900 dark:text-mint/40 h-4 w-4" />
          <Input
            placeholder="Search players..."
            className="pl-10 bg-gray-100 dark:bg-forest-light/50 dark:border-mint/10 text-sky-900 dark:text-mint"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <Select
        value={positionFilter}
        onValueChange={onPositionChange}
      >
        <SelectTrigger className="w-[180px] bg-gray-100 dark:bg-forest-light/50 dark:border-mint/10 text-sky-900 dark:text-mint">
          <SelectValue placeholder="All Positions" />
        </SelectTrigger>
        <SelectContent className="bg-gray-100 dark:bg-forest-light/100 text-sky-900 dark:text-mint border dark:border-mint/10 rounded-md">
          <SelectItem value="All Positions" className="bg-gray-100 dark:hover:bg-mint/10 focus:bg-gray-200 dark:focus:bg-mint/20 dark:text-mint cursor-pointer">All Positions</SelectItem>
          <SelectItem value="QB" className="hover:bg-gray-200 dark:hover:bg-mint/10 focus:bg-gray-200 dark:focus:bg-mint/20 dark:text-mint cursor-pointer">QB</SelectItem>
          <SelectItem value="RB" className="hover:bg-gray-200 dark:hover:bg-mint/10 focus:bg-gray-200 dark:focus:bg-mint/20 dark:text-mint cursor-pointer">RB</SelectItem>
          <SelectItem value="WR" className="hover:bg-gray-200 dark:hover:bg-mint/10 focus:bg-gray-200 dark:focus:bg-mint/20 dark:text-mint cursor-pointer">WR</SelectItem>
          <SelectItem value="TE" className="hover:bg-gray-200 dark:hover:bg-mint/10 focus:bg-gray-200 dark:focus:bg-mint/20 dark:text-mint cursor-pointer">TE</SelectItem>
          <SelectItem value="K" className="hover:bg-gray-200 dark:hover:bg-mint/10 focus:bg-gray-200 dark:focus:bg-mint/20 dark:text-mint cursor-pointer">K</SelectItem>
          <SelectItem value="DEF" className="hover:bg-gray-200 dark:hover:bg-mint/10 focus:bg-gray-200 dark:focus:bg-mint/20 dark:text-mint cursor-pointer">DEF</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={statusFilter}
        onValueChange={onStatusChange}
      >
        <SelectTrigger className="w-[180px] bg-gray-100 dark:bg-forest-light/50 dark:border-mint/10 text-sky-900 dark:text-mint">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent className="bg-gray-100 dark:bg-forest-light/100 text-sky-900 dark:text-mint border dark:border-mint/10 rounded-md">
          <SelectItem value="All Status" className="hover:bg-gray-200 dark:hover:bg-mint/10 focus:bg-gray-200 dark:focus:bg-mint/20 dark:text-mint cursor-pointer">All Status</SelectItem>
          <SelectItem value="Active" className="hover:bg-gray-200 dark:hover:bg-mint/10 focus:bg-gray-200 dark:focus:bg-mint/20 dark:text-mint cursor-pointer">Active</SelectItem>
          <SelectItem value="Inactive" className="hover:bg-gray-200 dark:hover:bg-mint/10 focus:bg-gray-200 dark:focus:bg-mint/20 dark:text-mint cursor-pointer">Inactive</SelectItem>
          <SelectItem value="IR" className="hover:bg-gray-200 dark:hover:bg-mint/10 focus:bg-gray-200 dark:focus:bg-mint/20 dark:text-mint cursor-pointer">IR</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};