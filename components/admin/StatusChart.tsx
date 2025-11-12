"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card } from '@/components/ui/Card';
import { TrendingUp } from 'lucide-react';

interface StatusChartProps {
  data: Record<string, number>;
}

const COLORS = {
  draft: '#94a3b8',
  pending: '#F59E0B',
  approved: '#D2AC6A',
  rejected: '#EF4444',
  completed: '#22C55E',
  cancelled: '#737373',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const StatusChart: React.FC<StatusChartProps> = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <Card>
        <h3 className="font-display text-lg text-neutral-900 mb-4">
          Orders by Status
        </h3>
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
            <p className="text-sm font-body text-neutral-500">No order data available</p>
          </div>
        </div>
      </Card>
    );
  }

  const chartData = Object.entries(data)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      color: COLORS[status as keyof typeof COLORS] || '#94a3b8',
    }));

  if (chartData.length === 0) {
    return (
      <Card>
        <h3 className="font-display text-lg text-neutral-900 mb-4">
          Orders by Status
        </h3>
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
            <p className="text-sm font-body text-neutral-500">No order data available</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="font-display text-lg text-neutral-900 mb-4">
        Orders by Status
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }: { name: string; percent: number }) => 
              percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
            }
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              fontFamily: 'Poppins, sans-serif',
              backgroundColor: '#fff',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: number) => [value, 'Orders']}
          />
          <Legend 
            wrapperStyle={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px' }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

