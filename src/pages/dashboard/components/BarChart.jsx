// src/pages/dashboard/components/BarChart.jsx
import React from "react";
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const BarChart = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface p-3 border border-border rounded shadow-sm">
          <p className="text-sm font-medium text-text-primary mb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center text-xs">
              <div 
                className="w-2 h-2 rounded-full mr-1" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-text-secondary">{entry.name}: </span>
              <span className="ml-1 font-medium text-text-primary">{entry.value} problems</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" />
        <XAxis 
          dataKey="month" 
          stroke="var(--color-text-tertiary)"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          stroke="var(--color-text-tertiary)" 
          tick={{ fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="leetcode" 
          name="LeetCode" 
          stackId="a" 
          fill="var(--color-leetcode)" 
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="codeforces" 
          name="Codeforces" 
          stackId="a" 
          fill="var(--color-codeforces)" 
          radius={[4, 4, 0, 0]}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;