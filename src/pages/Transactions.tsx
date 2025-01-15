import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SleeperTransaction } from "@/types/sleeper/transaction";
import { TransactionCard } from "@/components/transactions/TransactionCard";

interface LeagueTransactions {
  leagueName: string;
  transactions: SleeperTransaction[];
}

const Transactions = () => {
  const { data: allTransactions, isLoading } = useQuery({
    queryKey: ["all-transactions"],
    queryFn: async () => {
      // First, get all user leagues
      const { data: leagues } = await supabase
        .from("leagues")
        .select("league_id, name");

      if (!leagues) return [];

      // Fetch transactions for each league
      const leagueTransactions: LeagueTransactions[] = await Promise.all(
        leagues.map(async (league) => {
          const response = await fetch(
            `https://api.sleeper.app/v1/league/${league.league_id}/transactions/1`
          );
          if (!response.ok) {
            console.error(`Failed to fetch transactions for league ${league.league_id}`);
            return {
              leagueName: league.name,
              transactions: [],
            };
          }
          const transactions = await response.json();
          return {
            leagueName: league.name,
            transactions,
          };
        })
      );

      // Flatten and sort all transactions by date
      const allTransactions = leagueTransactions
        .flatMap(({ leagueName, transactions }) =>
          transactions.map((transaction) => ({
            ...transaction,
            leagueName,
          }))
        )
        .sort((a, b) => b.created - a.created);

      return allTransactions;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-mint">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-foreground">Recent Transactions</h1>
      </div>

      <div className="space-y-4">
        {allTransactions?.map((transaction) => (
          <TransactionCard
            key={transaction.transaction_id}
            transaction={transaction}
            leagueName={transaction.leagueName}
          />
        ))}
      </div>
    </div>
  );
};

export default Transactions;