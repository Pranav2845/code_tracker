import React from "react";
import { ResponsiveContainer, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from "recharts";

const RadarChart = ({ data }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface p-3 border border-border rounded shadow-sm">
          <p className="text-sm font-medium text-text-primary mb-1">{payload[0].payload.topic}</p>
          <div className="flex items-center text-xs">
            <div 
              className="w-2 h-2 rounded-full mr-1 bg-primary"
            ></div>
            <span className="text-text-secondary">Strength: </span>
            <span className="ml-1 font-medium text-text-primary">{payload[0].value}/100</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="var(--color-divider)" />
        <PolarAngleAxis 
          dataKey="topic" 
          tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
        />
        <PolarRadiusAxis 
          angle={30} 
          domain={[0, 100]} 
          tick={{ fontSize: 10, fill: "var(--color-text-tertiary)" }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Radar 
          name="Strength" 
          dataKey="score" 
          stroke="var(--color-primary)" 
          fill="var(--color-primary)" 
          fillOpacity={0.5} 
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
};

export default RadarChart;