import React from "react";
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from "recharts";

const PlatformTotalsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      return (
        <div className="bg-surface p-3 border border-border rounded shadow-sm">
          <p className="text-sm font-medium text-text-primary mb-1">{label}</p>
          <div className="flex items-center text-xs">
            <span className="text-text-secondary">Solved: </span>
            <span className="ml-1 font-medium text-text-primary">{entry.value} problems</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" />
        <XAxis dataKey="platform" stroke="var(--color-text-tertiary)" tick={{ fontSize: 12 }} />
        <YAxis stroke="var(--color-text-tertiary)" tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="solved" radius={[4,4,0,0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default PlatformTotalsChart;