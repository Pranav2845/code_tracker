import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from "recharts";

const TopicStrengthChart = ({ topicStrength = [] }) => {
  if (!topicStrength.length) return null;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { topic, score, solved } = payload[0].payload;
      return (
        <div className="bg-surface p-2 border border-border rounded shadow-sm text-xs">
          <p className="font-medium text-text-primary mb-1">{topic}</p>
          <p className="text-text-secondary">
            Score: <span className="font-medium text-text-primary">{score}%</span>
          </p>
          <p className="text-text-secondary">
            Solved: <span className="font-medium text-text-primary">{solved}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const colorFor = (s) => `hsl(240 70% ${90 - s * 0.4}% / 1)`; // stronger → darker

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={topicStrength}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" />
          <XAxis dataKey="topic" tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="score" radius={[4,4,0,0]}>
            {topicStrength.map((d, i) => (
              <Cell key={i} fill={colorFor(d.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopicStrengthChart;