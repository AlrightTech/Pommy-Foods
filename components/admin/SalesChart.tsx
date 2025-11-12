"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/Card';
import { Activity } from 'lucide-react';

interface SalesChartProps {
  data: Array<{ date: string; amount: number }>;
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <h3 className="font-display text-lg text-neutral-900 mb-4">
          Sales Trend (Last 30 Days)
        </h3>
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-center">
            <Activity className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
            <p className="text-sm font-body text-neutral-500">No sales data available</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="font-display text-lg text-neutral-900 mb-4">
        Sales Trend (Last 30 Days)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#737373', fontSize: 12, fontFamily: 'Poppins, sans-serif' }}
            tickFormatter={(value: string) => {
              try {
                return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              } catch {
                return value;
              }
            }}
          />
          <YAxis 
            tick={{ fill: '#737373', fontSize: 12, fontFamily: 'Poppins, sans-serif' }}
            tickFormatter={(value: number) => `$${value.toLocaleString()}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontFamily: 'Poppins, sans-serif',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Revenue']}
            labelFormatter={(label: string) => {
              try {
                return new Date(label).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
              } catch {
                return label;
              }
            }}
          />
          <Legend wrapperStyle={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px' }} />
          <Line 
            type="monotone" 
            dataKey="amount" 
            stroke="#D2AC6A" 
            strokeWidth={3}
            name="Revenue"
            dot={{ fill: '#D2AC6A', r: 5, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

