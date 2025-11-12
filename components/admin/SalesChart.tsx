"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/Card';

interface SalesChartProps {
  data: Array<{ date: string; amount: number }>;
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  return (
    <Card>
      <h3 className="font-display text-lg text-neutral-900 dark:text-neutral-100 mb-4">
        Sales Trend (Last 30 Days)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#737373' }}
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis 
            tick={{ fill: '#737373' }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e5e5',
              borderRadius: '8px'
            }}
            formatter={(value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="amount" 
            stroke="#C9A961" 
            strokeWidth={2}
            name="Revenue"
            dot={{ fill: '#C9A961', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

