import { Clock, Timer, Goal, UserCheck, Star, AlertTriangle } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
  TableHead,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { SleeperPlayer } from '@/types/sleeper/player';

interface PlayerStatsProps {
  player?: SleeperPlayer;
  isLoading?: boolean;
  showQuickStatsOnly?: boolean;
  showDetailedStatsOnly?: boolean;
}

export const PlayerStats = ({ 
  player, 
  isLoading = false,
  showQuickStatsOnly = false,
  showDetailedStatsOnly = false,
}: PlayerStatsProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-5 w-5" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white mb-4">Statistics</h2>
        <div className="flex flex-col items-center justify-center h-[200px] text-white/60">
          <p>No statistics available</p>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: Clock, label: "Search Rank", value: player.search_rank?.toString() || 'N/A' },
    { icon: Timer, label: "Age", value: player.age?.toString() || 'N/A' },
    { icon: Goal, label: "Position", value: player.position || 'N/A' },
    { icon: UserCheck, label: "Status", value: player.status || 'Active' },
    { icon: Star, label: "Experience", value: player.years_exp ? `${player.years_exp} years` : 'N/A' },
    { icon: AlertTriangle, label: "Injury Status", value: player.injury_status || 'None' },
  ];

  const detailedStats = [
    {
      category: "Personal Info",
      stats: [
        { label: "Full Name", value: player.full_name || 'N/A' },
        { label: "Team", value: player.team || 'N/A' },
        { label: "Number", value: player.number?.toString() || 'N/A' },
        { label: "College", value: player.college || 'N/A' },
      ]
    },
    {
      category: "Physical Stats",
      stats: [
        { label: "Height", value: player.height || 'N/A' },
        { label: "Weight", value: player.weight ? `${player.weight} lbs` : 'N/A' },
        { label: "Age", value: player.age?.toString() || 'N/A' },
      ]
    },
    {
      category: "Team Info",
      stats: [
        { label: "Position", value: player.position || 'N/A' },
        { label: "Depth Chart Position", value: player.depth_chart_position?.toString() || 'N/A' },
        { label: "Depth Chart Order", value: player.depth_chart_order?.toString() || 'N/A' },
      ]
    }
  ];

  return (
    <div className="space-y-8 h-full">
      {!showDetailedStatsOnly && (
        <div className="h-full flex flex-col justify-between">
          <h2 className="text-xl font-semibold text-sky-900 dark:text-mint mb-6 text-start">Quick Stats</h2>
          <div className="flex flex-col gap-4">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="group p-3 rounded-xl bg-gray-200 dark:bg-forest-light/30 backdrop-blur-sm border dark:border-mint/10 hover:border-mint/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-forest-light/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <stat.icon className="h-5 w-5 text-sky-900 dark:text-mint" />
                  </div>
                  <div>
                    <div className="text-sm text-sky-900 dark:text-white/60 transition-colors text-start">
                      {stat.label}
                    </div>
                    <div className="text-base font-semibold text-gray-900 dark:text-white text-start">
                      {stat.value}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!showQuickStatsOnly && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-start text-sky-900 dark:text-white mb-4">Detailed Statistics</h2>
          <div className="rounded-lg border dark:border-mint/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="dark:hover:bg-forest-light/40 border-b dark:border-mint/10">
                  <TableHead className="text-sky-900 dark:text-mint">Category</TableHead>
                  <TableHead className="text-sky-900 dark:text-mint">Stat</TableHead>
                  <TableHead className="text-sky-900 dark:text-mint">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailedStats.map((category, categoryIndex) => (
                  category.stats.map((stat, statIndex) => (
                    <TableRow 
                      key={`${categoryIndex}-${statIndex}`}
                      className="dark:hover:bg-forest-light/40 border-b dark:border-mint/10 last:border-0"
                    >
                      {statIndex === 0 && (
                        <TableCell 
                          className="font-medium text-sky-900 dark:text-white/80"
                          rowSpan={category.stats.length}
                        >
                          {category.category}
                        </TableCell>
                      )}
                      <TableCell className="text-sky-900 dark:text-white/60">{stat.label}</TableCell>
                      <TableCell className="text-sky-900 dark:text-white">{stat.value}</TableCell>
                    </TableRow>
                  ))
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};