import { format } from "date-fns";
import { Download, Users, ArrowLeftRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getAvatarUrl } from "@/utils/sleeper";
import { SleeperTransaction, TransactionType } from "@/types/sleeper/transaction";

const getTransactionIcon = (type: TransactionType) => {
  switch (type) {
    case 'free_agent':
      return <Download className="h-5 w-5 text-mint" />;
    case 'trade':
      return <ArrowLeftRight className="h-5 w-5 text-mint" />;
    case 'waiver':
      return <Clock className="h-5 w-5 text-mint" />;
    default:
      return <Download className="h-5 w-5 text-mint" />;
  }
};

const getTransactionTitle = (type: TransactionType) => {
  switch (type) {
    case 'free_agent':
      return 'Free Agent Acquisition';
    case 'trade':
      return 'Trade';
    case 'waiver':
      return 'Waiver Claim';
    default:
      return 'Transaction';
  }
};

interface TransactionCardProps {
  transaction: SleeperTransaction;
  leagueName: string;
}

export const TransactionCard = ({ transaction, leagueName }: TransactionCardProps) => {
  return (
    <Card className="p-6 bg-forest-light/30 border-mint/10">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getTransactionIcon(transaction.type)}
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-mint">
                {getTransactionTitle(transaction.type)}
              </span>
              <span className="text-sm text-white/60">{leagueName}</span>
            </div>
          </div>
          <span className="text-sm text-white/60">
            {format(new Date(transaction.created), "MMM d, yyyy h:mm a")}
          </span>
        </div>

        <div className="flex items-center gap-2 text-white/60">
          <Users className="h-4 w-4" />
          <span>Teams Involved:</span>
          {transaction.roster_ids.map((rosterId, index) => (
            <span key={rosterId} className="text-mint">
              Team {rosterId}
              {index < transaction.roster_ids.length - 1 ? ", " : ""}
            </span>
          ))}
        </div>

        {transaction.waiver_budget && transaction.waiver_budget.length > 0 && (
          <div className="text-white/60">
            FAAB Transfers:
            {transaction.waiver_budget.map((budget, index) => (
              <span key={index} className="ml-2 text-mint">
                Team {budget.sender} sends ${budget.amount} to Team {budget.receiver}
              </span>
            ))}
          </div>
        )}

        {transaction.adds && Object.keys(transaction.adds).length > 0 && (
          <div>
            <div className="text-green-400 mb-2">Added Players</div>
            {Object.entries(transaction.adds).map(([playerId, rosterId]) => (
              <div
                key={playerId}
                className="flex items-center justify-between p-3 rounded-lg bg-forest-dark/50 mb-2"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getAvatarUrl(playerId)} alt={playerId} />
                    <AvatarFallback>{playerId.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-white">Player ID: {playerId}</div>
                    <div className="text-sm text-white/60">
                      To: Team {rosterId}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-mint border-mint/20">
                  Added
                </Badge>
              </div>
            ))}
          </div>
        )}

        {transaction.drops && Object.keys(transaction.drops).length > 0 && (
          <div>
            <div className="text-red-400 mb-2">Dropped Players</div>
            {Object.entries(transaction.drops).map(([playerId, rosterId]) => (
              <div
                key={playerId}
                className="flex items-center justify-between p-3 rounded-lg bg-forest-dark/50"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getAvatarUrl(playerId)} alt={playerId} />
                    <AvatarFallback>{playerId.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-white">Player ID: {playerId}</div>
                    <div className="text-sm text-white/60">
                      From: Team {rosterId}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-red-400 border-red-400/20">
                  Dropped
                </Badge>
              </div>
            ))}
          </div>
        )}

        {transaction.draft_picks && transaction.draft_picks.length > 0 && (
          <div>
            <div className="text-blue-400 mb-2">Draft Picks Traded</div>
            {transaction.draft_picks.map((pick, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-forest-dark/50 mb-2"
              >
                <div className="flex items-center gap-3">
                  <div className="font-medium text-white">
                    {pick.season} Round {pick.round} Pick
                  </div>
                  <div className="text-sm text-white/60">
                    From Team {pick.previous_owner_id} to Team {pick.owner_id}
                  </div>
                </div>
                <Badge variant="outline" className="text-blue-400 border-blue-400/20">
                  Draft Pick
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};