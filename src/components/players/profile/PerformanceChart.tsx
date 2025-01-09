import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const performanceData = [
  { game: 'Week 1', points: 24 },
  { game: 'Week 2', points: 18 },
  { game: 'Week 3', points: 32 },
  { game: 'Week 4', points: 28 },
  { game: 'Week 5', points: 22 },
  { game: 'Week 6', points: 35 },
];

export const PerformanceChart = () => {
  const isLoading = false;
  const hasData = performanceData.length > 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white mb-4">Performance</h2>
        <div className="flex flex-col items-center justify-center h-[200px] text-white/60">
          <p>No performance data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white mb-4">Performance</h2>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis 
              dataKey="game" 
              stroke="#ffffff60"
              tick={{ fill: '#ffffff90' }}
              tickLine={{ stroke: '#ffffff30' }}
            />
            <YAxis 
              stroke="#ffffff60"
              tick={{ fill: '#ffffff90' }}
              tickLine={{ stroke: '#ffffff30' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(19, 43, 65, 0.95)',
                border: '1px solid rgba(100, 255, 218, 0.1)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(8px)'
              }}
              cursor={{ fill: 'rgba(100, 255, 218, 0.1)' }}
            />
            <Bar 
              dataKey="points" 
              fill="#64FFDA"
              radius={[4, 4, 0, 0]}
              className="transition-all duration-300 hover:opacity-80"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};