"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card } from '@/components/ui/Card';

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
  const chartData = Object.entries(data).map(([status, count]) => ({
    name: STATUS_LABELS[status] || status,
    value: count,
    color: COLORS[status as keyof typeof COLORS] || '#94a3b8',
  }));

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
            label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

