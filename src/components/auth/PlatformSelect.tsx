import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PlatformSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const PlatformSelect = ({ value, onChange }: PlatformSelectProps) => {
  const { data: platforms } = useQuery({
    queryKey: ['platforms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .eq('enabled', true);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="text-left">
      <label className="block text-sm font-medium text-sky-900 dark:text-mint/80 mb-2">
        Fantasy Platform
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-gray-100 dark:bg-forest-light/50 backdrop-blur-md border dark:border-mint/10 dark:focus:border-mint/20 text-sky-900 dark:text-white">
          <SelectValue placeholder="Select a platform" />
        </SelectTrigger>
        <SelectContent className="bg-gray-100 hover:bg-gray-200 dark:bg-forest-light/95 backdrop-blur-xl dark:border-mint/10">
          {platforms?.map((platform) => (
            <SelectItem 
              key={platform.id} 
              value={platform.name}
              className="dark:text-white dark:hover:bg-mint/20 dark:focus:bg-mint/20"
            >
              {platform.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};