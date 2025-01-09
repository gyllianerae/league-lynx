import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLeagues } from "@/hooks/useLeagues";
import { toast } from "sonner";

interface YearSelectorProps {
  selectedYear: string;
  onYearChange: (year: string) => void;
}

export const YearSelector = ({ selectedYear, onYearChange }: YearSelectorProps) => {
  const { leagues, refetchLeagues } = useLeagues();

  const handleYearChange = async (year: string) => {
    const hasDataForYear = leagues?.some(league => league.season === year);
    
    if (!hasDataForYear) {
      toast.loading("Fetching leagues for " + year);
      await refetchLeagues();
      toast.success("Updated leagues data");
    }
    
    onYearChange(year);
  };

  return (
    <Select
      value={selectedYear}
      onValueChange={handleYearChange}
    >
      <SelectTrigger className="w-[120px] bg-forest-light/50 backdrop-blur-md text-mint border-mint/10">
        <SelectValue placeholder="Select year" />
      </SelectTrigger>
      <SelectContent className="bg-forest-light/90 backdrop-blur-md border-mint/10">
        <SelectItem value="2024" className="text-mint hover:bg-forest-light/50">2024</SelectItem>
        <SelectItem value="2025" className="text-mint hover:bg-forest-light/50">2025</SelectItem>
      </SelectContent>
    </Select>
  );
};