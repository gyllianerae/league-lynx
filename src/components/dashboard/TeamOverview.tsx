import { League } from "@/types/database/league";
import { Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/utils/sleeper";

interface TeamOverviewProps {
  leagues: League[] | null;
  isLoading: boolean;
}

export const TeamOverview = ({ leagues, isLoading }: TeamOverviewProps) => {
  const formatRecord = (wins: number = 0, losses: number = 0, ties: number = 0) => {
    return `${wins}-${losses}${ties > 0 ? `-${ties}` : ''}`;
  };

  const formatPoints = (fpts: number = 0, decimal: number = 0) => {
    return `${fpts + decimal / 100}`;
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-100 dark:bg-forest-light/30 dark:border-mint/10">
        <CardContent className="p-4">
          <ScrollArea className="h-[400px] w-full">
            <Table>
              <TableHeader>
                <TableRow className="border-none">
                  <TableHead className="text-sky-900 dark:text-[#F1F1F1] font-bold">Team Name</TableHead>
                  <TableHead className="text-sky-900 dark:text-[#F1F1F1] font-bold">League</TableHead>
                  <TableHead className="text-sky-900 dark:text-[#F1F1F1] font-bold">Rank</TableHead>
                  <TableHead className="text-sky-900 dark:text-[#F1F1F1] font-bold">Record</TableHead>
                  <TableHead className="text-sky-900 dark:text-[#F1F1F1] font-bold text-right">Points For</TableHead>
                  <TableHead className="text-sky-900 dark:text-[#F1F1F1] font-bold text-right">Points Against</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, index) => (
                  <TableRow key={index} className="border-none">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full bg-gray-300 dark:bg-forest-light/50" />
                        <Skeleton className="h-4 w-32 bg-gray-300 dark:bg-forest-light/50" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full bg-gray-300 dark:bg-forest-light/50" />
                        <Skeleton className="h-4 w-24 bg-gray-300 dark:bg-forest-light/50" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-16 bg-gray-300 dark:bg-forest-light/50" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 bg-gray-300 dark:bg-forest-light/50" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto bg-gray-300 dark:bg-forest-light/50" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto bg-gray-300 dark:bg-forest-light/50" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  if (!leagues || leagues.length === 0) {
    return (
      <Card className="bg-gray-100 dark:bg-forest-light/30 dark:border-mint/10">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <Star className="h-12 w-12 text-sky-900 dark:text-mint/40 mb-4" />
            <h3 className="text-xl font-semibold text-sky-900 dark:text-mint mb-2">Fetching Your Teams</h3>
            <p className="text-sky-900 dark:text-white/60 max-w-md">
              We're connecting to Sleeper to retrieve your leagues and teams. This may take a moment...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="text-sky-900 bg-gray-100 dark:bg-forest-light/30 dark:border-mint/10 shadow-sm">
      <CardContent className="p-4">
        <ScrollArea className="h-[400px] w-full">
          <Table>
            <TableHeader>
              <TableRow className="border-none">
                <TableHead className="dark:text-[#F1F1F1] font-bold">Team Name</TableHead>
                <TableHead className="dark:text-[#F1F1F1] font-bold">League</TableHead>
                <TableHead className="dark:text-[#F1F1F1] font-bold">Rank</TableHead>
                <TableHead className="dark:text-[#F1F1F1] font-bold">Record</TableHead>
                <TableHead className="dark:text-[#F1F1F1] font-bold text-right">Points For</TableHead>
                <TableHead className="dark:text-[#F1F1F1] font-bold text-right">Points Against</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leagues.map((league: League) => (
                <TableRow 
                  key={league.id}
                  className={`
                    border-none hover:bg-gray-300 dark:hover:bg-forest-light/50 transition-colors
                    ${league.settings?.rank === 1 ? "bg-divine/5" : ""}
                  `}
                >
                  <TableCell className="dark:text-[#F1F1F1]">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage 
                          src={getAvatarUrl(league.settings?.owner_avatar)} 
                          alt={league.settings?.team_name || 'Team Avatar'}
                        />
                        <AvatarFallback className="bg-forest text-mint text-xs">
                          {(league.settings?.team_name || 'T').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{league.settings?.team_name || 'Unnamed Team'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-[#F1F1F1]">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage 
                          src={getAvatarUrl(league.avatar_id)} 
                          alt={league.name}
                        />
                        <AvatarFallback className="bg-forest text-mint text-xs">
                          {league.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{league.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-[#F1F1F1] flex items-center gap-1">
                    {league.settings?.rank ? (
                      <>
                        <span className={league.settings.rank === 1 ? "dark:text-divine font-bold" : ""}>
                          {`#${league.settings.rank}`}
                        </span>
                        {league.settings.rank === 1 && (
                          <Star className="h-4 w-4 dark:text-divine fill-divine" />
                        )}
                      </>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="dark:text-[#F1F1F1]">
                    {formatRecord(
                      league.settings?.wins,
                      league.settings?.losses,
                      league.settings?.ties
                    )}
                  </TableCell>
                  <TableCell className="dark:text-[#F1F1F1] text-right">
                    {formatPoints(league.settings?.fpts, league.settings?.fpts_decimal)}
                  </TableCell>
                  <TableCell className="dark:text-[#F1F1F1] text-right">
                    {formatPoints(league.settings?.fpts_against, league.settings?.fpts_against_decimal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};