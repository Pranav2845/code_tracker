import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const DifficultyChart = ({ difficultyData }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Transform the data for the chart
    const transformedData = [
      {
        name: "Easy",
        Solved: difficultyData.easy.solved,
        Attempted: difficultyData.easy.attempted,
        fill: "#10B981" // success color
      },
      {
        name: "Medium",
        Solved: difficultyData.medium.solved,
        Attempted: difficultyData.medium.attempted,
        fill: "#F59E0B" // warning color
      },
      {
        name: "Hard",
        Solved: difficultyData.hard.solved,
        Attempted: difficultyData.hard.attempted,
        fill: "#F43F5E" // error color
      }
    ];
    
    setChartData(transformedData);
  }, [difficultyData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface p-3 border border-border rounded-md shadow-sm">
          <p className="font-medium text-text-primary">{`${label} Problems`}</p>
          <p className="text-success text-sm">{`Solved: ${payload[0].value}`}</p>
          <p className="text-text-secondary text-sm">{`Attempted: ${payload[1].value}`}</p>
          <p className="text-text-tertiary text-xs mt-1">{`Success Rate: ${Math.round((payload[0].value / payload[1].value) * 100)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-text-primary mb-4">Difficulty Distribution</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fill: '#475569' }} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="Solved" 
              stackId="a" 
              fill="var(--color-primary)" 
              radius={[4, 4, 0, 0]} 
              barSize={30}
            />
            <Bar 
              dataKey="Attempted" 
              stackId="a" 
              fill="var(--color-divider)" 
              radius={[4, 4, 0, 0]} 
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-text-secondary">
        <p>This chart shows your solved vs. attempted problems across different difficulty levels.</p>
      </div>
    </div>
  );
};

export default DifficultyChart;