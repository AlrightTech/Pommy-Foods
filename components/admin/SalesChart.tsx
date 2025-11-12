"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/Card';

interface SalesChartProps {
  data: Array<{ date: string; amount: number }>;
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  return (
    <Card>
      <h3 className="font-display text-lg text-neutral-900 mb-4">
        Sales Trend (Last 30 Days)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#737373' }}
            tickFormatter={(value: string) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis 
            tick={{ fill: '#737373' }}
            tickFormatter={(value: number) => `$${value.toLocaleString()}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontFamily: 'Poppins, sans-serif'
            }}
            formatter={(value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            labelFormatter={(label: string) => new Date(label).toLocaleDateString()}
          />
          <Legend wrapperStyle={{ fontFamily: 'Poppins, sans-serif' }} />
          <Line 
            type="monotone" 
            dataKey="amount" 
            stroke="#D2AC6A" 
            strokeWidth={2}
            name="Revenue"
            dot={{ fill: '#D2AC6A', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

