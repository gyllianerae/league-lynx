import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const priceData = [
  { year: '2019', value: 18 },
  { year: '2020', value: 25 },
  { year: '2021', value: 28 },
  { year: '2022', value: 35 },
  { year: '2023', value: 36 },
  { year: '2024', value: 38 },
];

export const PriceChart = () => {
  const isLoading = false;
  const hasData = priceData.length > 0;

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
        <h2 className="text-xl font-semibold text-white mb-4">Price chart</h2>
        <div className="flex flex-col items-center justify-center h-[200px] text-white/60">
          <p>No price history available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-sky-900 dark:text-white mb-4 text-start">Price chart</h2>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={priceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis 
              dataKey="year" 
              stroke="#ffffff60"
              tick={{ fill: '#ffb703' }}
              tickLine={{ stroke: '#ffffff30' }}
            />
            <YAxis 
              stroke="#ffffff60"
              tick={{ fill: '#ffb703' }}
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
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#64FFDA"
              strokeWidth={2}
              dot={{ fill: '#64FFDA', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#64FFDA', stroke: '#132B41', strokeWidth: 2 }}
              className="transition-all duration-300 hover:opacity-80"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};