import React from "react";
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

const LineChart = ({ data }) => {
  // **Guard**: don’t render if there’s no data
  if (!data || data.length === 0) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface p-3 border border-border rounded shadow-sm">
          <p className="text-sm font-medium text-text-primary mb-1">{formatDate(label)}</p>
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
      <RechartsLineChart
        data={data}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          stroke="var(--color-text-tertiary)"
          tick={{ fontSize: 12 }}
        />
        <YAxis
          stroke="var(--color-text-tertiary)"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => value}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="leetcode"
          name="LeetCode"
          stroke="var(--color-leetcode)"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="codeforces"
          name="Codeforces"
          stroke="var(--color-codeforces)"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
         <Line type="monotone" dataKey="hackerrank" name="HackerRank" stroke="var(--color-success)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="gfg" name="GFG" stroke="var(--color-gfg)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="codingninjas" name="Coding Ninjas" stroke="var(--color-codingninjas)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="cses" name="CSES" stroke="var(--color-cses)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="codechef" name="CodeChef" stroke="var(--color-codechef)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default LineChart;
